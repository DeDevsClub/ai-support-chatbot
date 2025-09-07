import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import type { NextRequest } from 'next/server';
import { chatbotConfig } from '../../../lib/chatbot-config';
import arcjet, { tokenBucket, shield, detectBot } from '@arcjet/next';

// Initialize Arcjet with security rules
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Rate limiting
    tokenBucket({
      mode: 'LIVE',
      capacity: chatbotConfig.rateLimit.capacity,
      interval: `${chatbotConfig.rateLimit.interval}s`,
      refillRate: chatbotConfig.rateLimit.refillRate,
    }),
    // Bot detection
    ...(chatbotConfig.security.enableBotDetection ? [detectBot({
      mode: 'LIVE',
      allow: [],
    })] : []),
    // Content shield
    ...(chatbotConfig.security.enableShield ? [shield({
      mode: 'LIVE',
    })] : []),
  ],
});

export async function POST(req: NextRequest) {
  try {
    // Apply Arcjet protection
    const decision = await aj.protect(req, { requested: 1 });
  
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return new Response('Too many requests. Please try again later.', {
          status: 429,
          headers: {
            'Retry-After': '60',
          },
        });
      }
      
      if (decision.reason.isBot()) {
        return new Response('Bot detected. Access denied.', {
          status: 403,
        });
      }
      
      if (decision.reason.isShield()) {
        return new Response('Content filtered. Please modify your message.', {
          status: 400,
        });
      }
      
      return new Response('Access denied.', {
        status: 403,
      });
    }

    const { messages } = await req.json();

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response('Invalid messages format', {
        status: 400,
      });
    }

    // Content filtering
    if (chatbotConfig.security.contentFiltering.enabled) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.content && containsInappropriateContent(lastMessage.content)) {
        return new Response('Message contains inappropriate content', {
          status: 400,
        });
      }
    }

    // Initialize AI model
    const model = google(chatbotConfig.api.model);

    // Generate response
    const result = await streamText({
      model,
      system: chatbotConfig.api.systemPrompt,
      messages,
      temperature: chatbotConfig.api.temperature,
    });

    return result.toTextStreamResponse();

  } catch (error: unknown) {
    console.error('Chat API Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Handle specific errors
    if (errorMessage.includes('API key')) {
      return new Response('AI service configuration error. Please check API keys.', {
        status: 500,
      });
    }
    
    if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
      return new Response('AI service quota exceeded. Please try again later.', {
        status: 429,
      });
    }
    
    return new Response('Internal server error. Please try again.', {
      status: 500,
    });
  }
}

// Simple content filtering function
function containsInappropriateContent(content: string): boolean {
  if (!chatbotConfig.security.contentFiltering.enabled) {
    return false;
  }
  
  const inappropriatePatterns = [
    // Add your content filtering patterns here
    /\b(spam|scam|phishing)\b/i,
    // Add more patterns as needed
  ];
  
  if (chatbotConfig.security.contentFiltering.strictMode) {
    // Add more strict patterns
    inappropriatePatterns.push(
      /\b(hack|exploit|malware)\b/i,
    );
  }
  
  return inappropriatePatterns.some(pattern => pattern.test(content));
}
