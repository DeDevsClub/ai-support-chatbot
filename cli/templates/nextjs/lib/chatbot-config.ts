/**
 * AI Support Chatbot Configuration
 * Template for {{PROJECT_NAME}}
 */

export const chatbotConfig = {
  name: "{{PROJECT_NAME}}",
  version: "2.0.0",
  welcomeMessage: "Hello! I'm your AI assistant. How can I help you today?",
  
  ui: {
    windowTitle: "AI Assistant",
    inputPlaceholder: "Type your message...",
    avatarImage: "/ai-avatar.png",
    avatarFallback: "AI",
    theme: {
      primaryColor: "{{PRIMARY_COLOR}}",
      borderRadius: "md" as "none" | "sm" | "md" | "lg" | "xl",
      animation: {
        enabled: true,
        duration: 300,
        easing: "ease-out",
      },
    },
    positioning: {
      mobile: {
        fullscreen: true,
      },
      desktop: {
        position: "bottom-right" as const,
        offset: { x: 20, y: 20 },
        size: { width: 400, height: 600 },
      },
    },
  },

  features: {
    conversationHistory: true,
    fileUpload: false,
    voiceInput: false,
    suggestions: true,
    feedback: true,
    export: false,
  },

  api: {
    model: "gemini-2.5-flash-lite",
    systemPrompt: `You are a helpful AI assistant for {{PROJECT_NAME}}. 
    Provide clear, concise, and accurate responses to user questions. 
    Be friendly, professional, and helpful in all interactions.
    
    When appropriate, you can use these formats at the end of your response:
    - {{choice:Option Name}} - Creates clickable choice buttons
    - {{link:https://url.com|Button Text}} - Creates clickable link buttons`,
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9,
    frequencyPenalty: 0,
    presencePenalty: 0,
    timeout: 30000,
  },

  security: {
    enableBotDetection: true,
    enableShield: true,
    contentFiltering: {
      enabled: true,
      strictMode: false,
    },
  },

  rateLimit: {
    capacity: 5,
    refillRate: 2,
    interval: 10,
    maxMessageLength: 1000,
  },
} as const;

export type ChatbotConfig = typeof chatbotConfig;
