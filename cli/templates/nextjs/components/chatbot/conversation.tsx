'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from "@ai-sdk/react";
import { Message } from './message';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Send, Loader2 } from 'lucide-react';
import { chatbotConfig } from '../../lib/chatbot-config';

type ErrorMessage = {
  error: Error;
  message: string;
  status: number;
  statusCode: number;
  response: Response;
};

interface ConversationProps {
  onClose: () => void;
}

export function Conversation({ onClose }: ConversationProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number | null>(
    null
  );
  const lastMessageTime = useRef(Date.now());

  const { messages, sendMessage, setMessages, status } = useChat({
    messages: [
      {
        id: "welcome",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: chatbotConfig.welcomeMessage,
          },
        ],
      },
    ],
    onError: (error) => {
      // Check for rate limiting (429 status code)
      const isRateLimit =
        (error as unknown as ErrorMessage).status === 429 ||
        (error as unknown as ErrorMessage).statusCode === 429 ||
        error.message?.includes("429") ||
        error.message?.toLowerCase().includes("rate limit") ||
        error.message?.toLowerCase().includes("too many requests");

      if (isRateLimit) {
        setIsRateLimited(true);
        setRateLimitCountdown(chatbotConfig.rateLimit.interval);

        setTimeout(() => {
          setIsRateLimited(false);
          setRateLimitCountdown(null);
        }, chatbotConfig.rateLimit.interval * 1000);
      } else {
        // Handle other errors
        setRateLimitCountdown(5);
        setTimeout(() => setRateLimitCountdown(null), 5000);
      }
    },
  });


  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const messageText = input;
    setInput("");
    sendMessage({
      role: "user",
      parts: [{ type: "text", text: messageText }],
    } as any);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input when conversation opens
    inputRef.current?.focus();
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    handleSubmit(e);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            isLoading={isLoading && message === messages[messages.length - 1]}
          />
        ))}
        {isLoading && messages.length > 0 && (messages[messages.length - 1] as any).role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-gradient-to-br from-gray-950 to-black rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={onSubmit} className="flex space-x-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            placeholder={chatbotConfig.ui.inputPlaceholder}
            disabled={isLoading}
            className="flex-1"
            maxLength={chatbotConfig.rateLimit?.maxMessageLength || 1000}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{ backgroundColor: chatbotConfig.ui.theme.primaryColor }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        {/* Features */}
        <div className="mt-2 flex flex-wrap gap-2">
          {chatbotConfig.features.suggestions && (
            <div className="flex flex-wrap gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleInputChange({
                    target: { value: "What can you help me with?" }
                  } as any);
                }}
                className="text-xs"
              >
                What can you help me with?
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleInputChange({
                    target: { value: "Tell me about your features" }
                  } as any);
                }}
                className="text-xs"
              >
                Features
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
