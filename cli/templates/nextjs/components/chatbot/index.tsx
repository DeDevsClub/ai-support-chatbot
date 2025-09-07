'use client';

import React, { useState } from 'react';
import { Conversation } from './conversation';
import { chatbotConfig } from '../../lib/chatbot-config';
import { Button } from '../../components/ui/button';
import { MessageCircle, X } from 'lucide-react';

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        style={{
          backgroundColor: chatbotConfig.ui.theme.primaryColor,
          bottom: `${chatbotConfig.ui.positioning.desktop.offset.y}px`,
          right: `${chatbotConfig.ui.positioning.desktop.offset.x}px`,
        }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bg-white border border-gray-200 shadow-xl z-40"
          style={{
            bottom: `${chatbotConfig.ui.positioning.desktop.offset.y + 80}px`,
            right: `${chatbotConfig.ui.positioning.desktop.offset.x}px`,
            width: `${chatbotConfig.ui.positioning.desktop.size.width}px`,
            height: `${chatbotConfig.ui.positioning.desktop.size.height}px`,
            borderRadius: chatbotConfig.ui.theme.borderRadius === 'none' ? '0' : 
                         chatbotConfig.ui.theme.borderRadius === 'sm' ? '0.375rem' :
                         chatbotConfig.ui.theme.borderRadius === 'md' ? '0.5rem' :
                         chatbotConfig.ui.theme.borderRadius === 'lg' ? '0.75rem' : '1rem',
          }}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div 
              className="flex items-center justify-between p-4 border-b"
              style={{ backgroundColor: chatbotConfig.ui.theme.primaryColor }}
            >
              <h3 className="text-white font-semibold">
                {chatbotConfig.ui.windowTitle}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleChat}
                className="text-white hover:bg-white/20"
              >
                <X size={20} />
              </Button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-hidden">
              <Conversation onClose={toggleChat} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-50">
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div 
              className="flex items-center justify-between p-4 border-b"
              style={{ backgroundColor: chatbotConfig.ui.theme.primaryColor }}
            >
              <h3 className="text-white font-semibold">
                {chatbotConfig.ui.windowTitle}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleChat}
                className="text-white hover:bg-white/20"
              >
                <X size={20} />
              </Button>
            </div>

            {/* Mobile Chat Content */}
            <div className="flex-1 overflow-hidden">
              <Conversation onClose={toggleChat} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
