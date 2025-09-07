'use client';

import React from 'react';
import { UIMessage as MessageType } from 'ai';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { chatbotConfig } from '../../lib/chatbot-config';
import ReactMarkdown from 'react-markdown';

interface MessageProps {
  message: MessageType;
  isLoading?: boolean;
}

export function Message({ message, isLoading }: MessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // Extract text content from message parts
  const getMessageContent = (message: MessageType): string => {
    if ('content' in message && typeof message.content === 'string') {
      return message.content;
    }
    if ('parts' in message && Array.isArray(message.parts)) {
      return message.parts
        .filter(part => part.type === 'text')
        .map(part => part.text)
        .join('');
    }
    return '';
  };

  const messageContent = getMessageContent(message);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleFeedback = (type: 'positive' | 'negative') => {
    // In a real implementation, you would send this feedback to your analytics service
    console.log(`Feedback: ${type} for message ${message.id}`);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
        {/* Avatar */}
        {isAssistant && (
          <Avatar className="h-8 w-8 mt-1">
            {chatbotConfig.ui.avatarImage && (
              <AvatarImage src={chatbotConfig.ui.avatarImage} alt="AI Assistant" />
            )}
            <AvatarFallback className="text-xs">
              {chatbotConfig.ui.avatarFallback}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Message Content */}
        <div
          className={`rounded-lg p-3 ${
            isUser
              ? 'bg-blue-500 text-white ml-2'
              : 'bg-gray-100 text-gray-900 mr-2'
          }`}
          style={{
            backgroundColor: isUser ? chatbotConfig.ui.theme.primaryColor : undefined,
            borderRadius: (() => {
              switch (chatbotConfig.ui.theme.borderRadius) {
                case 'none': return '0';
                case 'sm': return '0.375rem';
                case 'md': return '0.5rem';
                case 'lg': return '0.75rem';
                case 'xl': return '1rem';
                default: return '0.5rem';
              }
            })(),
          }}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{messageContent}</p>
          ) : (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0 text-sm">{children}</p>,
                  ul: ({ children }) => <ul className="mb-2 last:mb-0 text-sm list-disc pl-4">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-2 last:mb-0 text-sm list-decimal pl-4">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  code: ({ children }) => (
                    <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-200 p-2 rounded text-xs font-mono overflow-x-auto">
                      {children}
                    </pre>
                  ),
                }}
              >
                {messageContent}
              </ReactMarkdown>
            </div>
          )}

          {/* Message Actions */}
          {isAssistant && !isLoading && (
            <div className="flex items-center justify-end mt-2 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(messageContent)}
                className="h-6 w-6 p-0 hover:bg-gray-200"
              >
                <Copy className="h-3 w-3" />
              </Button>
              
              {chatbotConfig.features.feedback && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback('positive')}
                    className="h-6 w-6 p-0 hover:bg-gray-200"
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback('negative')}
                    className="h-6 w-6 p-0 hover:bg-gray-200"
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
