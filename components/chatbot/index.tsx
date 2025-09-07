"use client";

import { useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "./conversation";
import { Message, MessageContent } from "./message";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";
import { ExternalLink, MessageSquareIcon, RotateCw, X, Expand } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from "./prompt-input";
import { chatbotConfig } from "@/lib/config";

type ErrorMessage = {
  error: Error;
  message: string;
  status: number;
  statusCode: number;
  response: Response;
};

const ChatBotWrapper = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="">
      <Button
        size="sm"
        className="fixed bottom-5 right-5 rounded-full p-4 h-fit bg-gradient-to-br from-gray-950 to-black text-gray-100 hover:bg-gray-900 border-gray-700 backdrop-blur-sm border-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageSquareIcon className="size-5" />
      </Button>

      <AnimatePresence mode="wait">
        {isOpen && !isExpanded && (
          <ChatBot
            key="chatbot"
            onClose={() => setIsOpen(false)}
            onExpand={() => setIsExpanded(true)}
          />
        )}
      </AnimatePresence>

      <Sheet open={isExpanded} onOpenChange={setIsExpanded}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg bg-gradient-to-br from-gray-950 to-black text-gray-100 border-gray-700"
        >
          <SheetHeader className="border-b border-gray-700 pb-4">
            <SheetTitle className="text-gray-100 flex items-center justify-between">
              {chatbotConfig.ui.windowTitle}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 h-full">
            <ChatBotContent />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ChatBotWrapper;

export const ChatBot = ({ onClose, onExpand }: { onClose: () => void; onExpand?: () => void }) => {
  const [input, setInput] = useState("");
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

  const sendMessageWithThrottle = async (text: string) => {
    const now = Date.now();
    const timeSinceLastMessage = now - lastMessageTime.current;
    // Prevent spam (minimum time between messages)
    if (timeSinceLastMessage < chatbotConfig.rateLimit.minTimeBetweenMessages) {
      return;
    }
    // Don't send if rate limited
    if (isRateLimited) {
      return;
    }
    lastMessageTime.current = now;
    await sendMessage({ text });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      input.trim() &&
      !isRateLimited &&
      input.length <= chatbotConfig.rateLimit.maxMessageLength
    ) {
      sendMessageWithThrottle(input);
      setInput("");
    }
  };

  const isInputValid =
    input.length <= chatbotConfig.rateLimit.maxMessageLength &&
    input.trim().length > 0;

  const handleConversationChoice = (choice: string) => {
    if (!isRateLimited) {
      sendMessageWithThrottle(choice);
    }
  };

  const handleLinkClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const clearMessages = () => {
    // Clear all error and rate limit state when resetting chat
    setIsRateLimited(false);
    setRateLimitCountdown(null);
    setMessages([
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
    ]);
  };

  // Format countdown message
  const getRateLimitMessage = () => {
    if (rateLimitCountdown !== null && rateLimitCountdown > 0) {
      return `Rate limit exceeded. Please wait ${rateLimitCountdown} second${rateLimitCountdown !== 1 ? "s" : ""
        }...`;
    }
    return "Rate limit exceeded. Please wait...";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`
            justify-between flex flex-col
            fixed z-20 bg-gradient-to-br from-gray-950 to-black text-gray-100 backdrop-blur-sm border-2 border-gray-700
            inset-0 w-screen h-screen rounded-none
            md:max-w-100 md:w-full md:h-110 md:bottom-20 md:right-4 md:rounded-sm md:border md:inset-auto
          `}
    >
      {isRateLimited && (
        <div className="text-red-100 rounded text-xs absolute bottom-16 w-full text-center z-10 bg-red-900/80 px-2 py-1">
          {getRateLimitMessage()}
        </div>
      )}
      <div className="px-2 py-2 flex flex-row justify-between items-center border-b border-gray-700">
        <div className="flex-col pl-2">
          <p className="font-bold">{chatbotConfig.ui.windowTitle}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button onClick={clearMessages} size="icon" variant="ghost" className="text-gray-100 hover:bg-gray-900">
            <RotateCw />
          </Button>
          {onExpand && (
            <Button onClick={onExpand} size="icon" variant="ghost" className="text-gray-100 hover:bg-gray-900">
              <Expand />
            </Button>
          )}
          <Button onClick={onClose} size="icon" variant="ghost" className="text-gray-100 hover:bg-gray-900">
            <X />
          </Button>
        </div>
      </div>
      <Conversation className="overflow-hidden">
        <ConversationContent className="px-2">
          {messages.map((message) => (
            <div key={message.id}>
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <MarkdownWithButtons
                            key={`${message.id}-${i}`}
                            onConversationChoice={handleConversationChoice}
                            onLinkClick={handleLinkClick}
                            isRateLimited={isRateLimited}
                            status={status}
                          >
                            {part.text}
                          </MarkdownWithButtons>
                        );
                      default:
                        return null;
                    }
                  })}
                </MessageContent>
              </Message>
            </div>
          ))}
          {status === "submitted" && (
            <Message
              from="assistant"
              aria-live="polite"
              aria-label="AI is thinking..."
            >
              <MessageContent>
                <div className="flex gap-1 justify-center items-center py-2 px-1">
                  <span className="sr-only">Loading...</span>
                  <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce delay-150"></div>
                  <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce delay-300"></div>
                </div>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <PromptInput
        onSubmit={handleSubmit}
        className="flex items-center py-2 px-2 gap-2 border-t border-gray-700 backdrop-blur-sm border-2 bg-gray-900"
      >
        <PromptInputTextarea
          onChange={(e) => setInput(e.target.value)}
          value={input}
          className=""
          placeholder={
            isRateLimited
              ? "Rate limited, please wait..."
              : chatbotConfig.ui.inputPlaceholder
          }
          disabled={isRateLimited}
        />
        <PromptInputSubmit
          disabled={!isInputValid || isRateLimited || status === "submitted"}
          status={status}
          className="rounded-sm self-start"
        />
      </PromptInput>
    </motion.div>
  );
};

// Shared content component for both regular and sheet chatbot
const ChatBotContent = () => {
  const [input, setInput] = useState("");
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

  const sendMessageWithThrottle = async (text: string) => {
    const now = Date.now();
    const timeSinceLastMessage = now - lastMessageTime.current;
    // Prevent spam (minimum time between messages)
    if (timeSinceLastMessage < chatbotConfig.rateLimit.minTimeBetweenMessages) {
      return;
    }
    // Don't send if rate limited
    if (isRateLimited) {
      return;
    }
    lastMessageTime.current = now;
    await sendMessage({ text });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      input.trim() &&
      !isRateLimited &&
      input.length <= chatbotConfig.rateLimit.maxMessageLength
    ) {
      sendMessageWithThrottle(input);
      setInput("");
    }
  };

  const isInputValid =
    input.length <= chatbotConfig.rateLimit.maxMessageLength &&
    input.trim().length > 0;

  const handleConversationChoice = (choice: string) => {
    if (!isRateLimited) {
      sendMessageWithThrottle(choice);
    }
  };

  const handleLinkClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const clearMessages = () => {
    // Clear all error and rate limit state when resetting chat
    setIsRateLimited(false);
    setRateLimitCountdown(null);
    setMessages([
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
    ]);
  };

  // Format countdown message
  const getRateLimitMessage = () => {
    if (rateLimitCountdown !== null && rateLimitCountdown > 0) {
      return `Rate limit exceeded. Please wait ${rateLimitCountdown} second${rateLimitCountdown !== 1 ? "s" : ""
        }...`;
    }
    return "Rate limit exceeded. Please wait...";
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100">
      {isRateLimited && (
        <div className="text-red-100 rounded text-xs absolute bottom-16 w-full text-center z-10 bg-red-900/80 px-2 py-1">
          {getRateLimitMessage()}
        </div>
      )}
      {/* Conversation */}
      <Conversation className="overflow-hidden flex-1 bg-gradient-to-br from-gray-950 to-black">
        <ConversationContent className="px-2">
          {messages.map((message) => (
            <div key={message.id}>
              <Message from={message.role} key={message.id} className="bg-gradient-to-br from-gray-950 to-black">
                <MessageContent>
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <MarkdownWithButtons
                            key={`${message.id}-${i}`}
                            onConversationChoice={handleConversationChoice}
                            onLinkClick={handleLinkClick}
                            isRateLimited={isRateLimited}
                            status={status}
                          >
                            {part.text}
                          </MarkdownWithButtons>
                        );
                      default:
                        return null;
                    }
                  })}
                </MessageContent>
              </Message>
            </div>
          ))}
          {status === "submitted" && (
            <Message
              from="assistant"
              aria-live="polite"
              aria-label="AI is thinking..."
            >
              <MessageContent>
                <div className="flex gap-1 justify-center items-center py-2 px-1">
                  <span className="sr-only">Loading...</span>
                  <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce delay-150"></div>
                  <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce delay-300"></div>
                </div>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput
        onSubmit={handleSubmit}
        className="flex items-center py-2 px-2 gap-2 border-t border-gray-700 bg-gray-900 h-16"
      >
        <PromptInputTextarea
          onChange={(e) => setInput(e.target.value)}
          value={input}
          className=""
          placeholder={
            isRateLimited
              ? "Rate limited, please wait..."
              : chatbotConfig.ui.inputPlaceholder
          }
          disabled={isRateLimited}
        />
        <PromptInputSubmit
          disabled={!isInputValid || isRateLimited || status === "submitted"}
          status={status}
          className="rounded-sm self-start"
        />
      </PromptInput>
    </div>
  );
};

const MarkdownWithButtons = ({
  children,
  onConversationChoice,
  onLinkClick,
  isRateLimited,
  status,
}: {
  children: string;
  onConversationChoice: (choice: string) => void;
  onLinkClick: (url: string) => void;
  isRateLimited: boolean;
  status: string;
}) => {
  // Extract and remove conversation choices from markdown
  const conversationChoiceRegex = /\{\{choice:([^}]+)\}\}/g;
  const linkButtonRegex = /\{\{link:([^|]+)\|([^}]+)\}\}/g;
  const conversationChoices: string[] = [];
  const linkButtons: { url: string; label: string }[] = [];
  let match: RegExpExecArray | null;

  match = conversationChoiceRegex.exec(children);
  while (match !== null) {
    conversationChoices.push(match[1].trim());
    match = conversationChoiceRegex.exec(children);
  }

  match = linkButtonRegex.exec(children);
  while (match !== null) {
    linkButtons.push({
      url: match[1].trim(),
      label: match[2].trim(),
    });
    match = linkButtonRegex.exec(children);
  }
  const cleanMarkdown = children
    .replace(conversationChoiceRegex, "")
    .replace(linkButtonRegex, "")
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();

  return (
    <div>
      <div className="prose prose-invert text-sm text-gray-100">
        <ReactMarkdown>{cleanMarkdown}</ReactMarkdown>
      </div>
      {(conversationChoices.length > 0 || linkButtons.length > 0) && (
        <div className="flex flex-row flex-wrap mt-2 gap-2">
          {conversationChoices.map((choice) => (
            <Button
              key={choice}
              variant="outline"
              size="sm"
              onClick={() => onConversationChoice(choice)}
              disabled={isRateLimited || status === "submitted"}
              className={`text-xs rounded-full shadow-none bg-gray-900 text-gray-100 border-gray-600 hover:bg-gray-700 ${isRateLimited ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              {choice}
            </Button>
          ))}

          {/* Render link buttons */}
          {linkButtons.map((button) => (
            <Button
              key={button.label}
              variant="default"
              size="sm"
              onClick={() => onLinkClick(button.url)}
              className="text-xs rounded-full shadow-none bg-gray-100 text-gray-900 hover:bg-gray-200"
            >
              {button.label}
              <ExternalLink className="w-3 h-3 mr-1" />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
