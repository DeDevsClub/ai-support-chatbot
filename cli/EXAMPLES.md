# AI Support Chatbot CLI - Examples

This document provides comprehensive examples of how to use the AI Support Chatbot CLI in various scenarios.

## 🚀 Getting Started Examples

### Example 1: Create a New Next.js Chatbot Project

```bash
# Interactive setup
ai-chatbot init

# Quick setup with defaults
ai-chatbot init my-support-bot --framework nextjs

# Advanced setup with custom configuration
ai-chatbot init enterprise-bot \
  --framework nextjs \
  --directory ./projects/chatbot \
  --no-git
```

**Expected Output:**
```
🤖 Initializing AI Support Chatbot Project

✓ Project structure created
✓ Git repository initialized
✓ Dependencies installed

🎉 Project created successfully!

Next steps:
  1. cd my-support-bot
  2. Configure your API keys in .env.local
  3. npm run dev
```

### Example 2: Add Chatbot to Existing React Project

```bash
# Navigate to your existing React project
cd my-react-app

# Interactive installation
ai-chatbot install --interactive

# Or quick installation
ai-chatbot install --framework react
```

**Expected Output:**
```
🤖 Installing AI Support Chatbot

📋 Project Information:
  Name: my-react-app
  Framework: react
  Package Manager: npm
  TypeScript: Yes
  Tailwind CSS: Yes

✓ Chatbot components installed
✓ Dependencies installed

🎉 AI Support Chatbot installed successfully!
```

## 🎛️ Configuration Examples

### Example 3: Interactive Configuration

```bash
ai-chatbot configure --interactive
```

**Interactive Prompts:**
```
🤖 Configuring AI Support Chatbot

🎛️  Interactive Configuration

? Chatbot name: Customer Support Bot
? Welcome message: Hi! I'm here to help with your questions.
? Chat window title: Support Assistant
? Input placeholder text: Ask me anything...
? Select features to enable: 
  ◉ Conversation History
  ◯ File Upload Support
  ◉ Voice Input
  ◉ Smart Suggestions
  ◉ User Feedback
  ◯ Export Conversations
? Primary color (hex code): #10B981
? Border radius style: Large
? Desktop position: Bottom Right
? AI model: Gemini 2.5 Flash (Balanced)
? Response creativity (temperature): 0.8
? Maximum response length (tokens): 2048
? Enable bot detection? Yes
? Enable content shield? Yes
? Enable content filtering? Yes
? Rate limit capacity (messages per window): 10

✓ Configuration saved to lib/chatbot-config.ts

🎉 Configuration updated successfully!
```

### Example 4: Using Configuration Presets

```bash
# Basic preset for development
ai-chatbot configure --preset basic

# Advanced preset for production
ai-chatbot configure --preset advanced

# Enterprise preset with maximum security
ai-chatbot configure --preset enterprise
```

## 🔧 Framework-Specific Examples

### Example 5: Next.js Integration

**Project Structure After Installation:**
```
my-nextjs-app/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # AI chat endpoint
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── chatbot/
│   │   ├── index.tsx             # Main chatbot component
│   │   ├── conversation.tsx      # Chat conversation
│   │   └── message.tsx           # Message component
│   └── ui/                       # Shadcn UI components
├── lib/
│   └── chatbot-config.ts         # Configuration file
├── .env.local                    # Environment variables
└── package.json
```

**Usage in Next.js:**
```tsx
// app/layout.tsx
import { Chatbot } from '@/components/chatbot';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Chatbot />
      </body>
    </html>
  );
}
```

### Example 6: React (Vite) Integration

```bash
# Create new Vite React project
npm create vite@latest my-react-chatbot -- --template react-ts
cd my-react-chatbot
npm install

# Install chatbot
ai-chatbot install --framework react --interactive
```

**Usage in React:**
```tsx
// src/App.tsx
import { Chatbot } from './components/chatbot';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>My React App</h1>
      </header>
      <main>
        {/* Your app content */}
      </main>
      <Chatbot />
    </div>
  );
}

export default App;
```

### Example 7: Vue.js Integration

```bash
# Create new Vue project
npm create vue@latest my-vue-chatbot
cd my-vue-chatbot
npm install

# Install chatbot
ai-chatbot install --framework vue --interactive
```

**Usage in Vue:**
```vue
<!-- src/App.vue -->
<template>
  <div id="app">
    <header>
      <h1>My Vue App</h1>
    </header>
    <main>
      <!-- Your app content -->
    </main>
    <ChatBot />
  </div>
</template>

<script setup lang="ts">
import ChatBot from './components/chatbot/ChatBot.vue';
</script>
```

## 🔐 Security Configuration Examples

### Example 8: Enhanced Security Setup

```typescript
// lib/chatbot-config.ts
export const chatbotConfig = {
  // ... other config
  
  security: {
    enableBotDetection: true,
    enableShield: true,
    allowedBots: ['googlebot', 'bingbot'],
    contentFiltering: {
      enabled: true,
      strictMode: true,
      customFilters: [
        'spam',
        'phishing',
        'malware'
      ],
    },
    cors: {
      origins: ['https://myapp.com', 'https://www.myapp.com'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    encryption: {
      enabled: true,
      algorithm: 'AES-256-GCM',
    },
  },

  rateLimit: {
    capacity: 10,
    refillRate: 5,
    interval: 60,
    minTimeBetweenMessages: 2000,
    maxMessageLength: 500,
    strategy: 'sliding-window',
    burstAllowance: 3,
    gracePeriod: 10,
  },
};
```

### Example 9: Development vs Production Configuration

```typescript
// lib/chatbot-config.ts
const isDevelopment = process.env.NODE_ENV === 'development';

export const chatbotConfig = {
  name: "Support Bot",
  version: "2.0.0",
  environment: process.env.NODE_ENV,
  
  security: {
    enableBotDetection: !isDevelopment,
    enableShield: !isDevelopment,
    contentFiltering: {
      enabled: !isDevelopment,
      strictMode: !isDevelopment,
    },
  },

  rateLimit: {
    capacity: isDevelopment ? 100 : 10,
    refillRate: isDevelopment ? 50 : 5,
    interval: isDevelopment ? 1 : 60,
  },

  api: {
    model: isDevelopment ? "gemini-2.5-flash-lite" : "gemini-2.5-flash",
    temperature: isDevelopment ? 0.9 : 0.7,
    maxTokens: isDevelopment ? 4000 : 2048,
  },
};
```

## 🎨 Customization Examples

### Example 10: Custom Theming

```typescript
// lib/chatbot-config.ts
export const chatbotConfig = {
  ui: {
    theme: {
      primaryColor: "#7C3AED", // Purple theme
      borderRadius: "xl",
      animation: {
        enabled: true,
        duration: 500,
        easing: "ease-in-out",
      },
    },
    positioning: {
      desktop: {
        position: "bottom-left",
        offset: { x: 30, y: 30 },
        size: { width: 450, height: 650 },
      },
    },
  },

  customization: {
    css: `
      .chatbot-container {
        box-shadow: 0 25px 50px -12px rgba(124, 58, 237, 0.25);
        backdrop-filter: blur(16px);
      }
      
      .chatbot-header {
        background: linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%);
      }
      
      .message-user {
        background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%);
      }
    `,
  },
};
```

### Example 11: Multi-language Configuration

```typescript
// lib/chatbot-config.ts
export const chatbotConfig = {
  i18n: {
    enabled: true,
    defaultLocale: "en",
    supportedLocales: ["en", "es", "fr", "de", "ja"],
    fallbackLocale: "en",
    autoDetect: true,
    translations: {
      en: {
        welcome: "Hello! How can I help you today?",
        placeholder: "Type your message...",
        send: "Send",
        thinking: "Thinking...",
      },
      es: {
        welcome: "¡Hola! ¿Cómo puedo ayudarte hoy?",
        placeholder: "Escribe tu mensaje...",
        send: "Enviar",
        thinking: "Pensando...",
      },
      fr: {
        welcome: "Bonjour! Comment puis-je vous aider aujourd'hui?",
        placeholder: "Tapez votre message...",
        send: "Envoyer",
        thinking: "Réflexion...",
      },
    },
  },
};
```

## 📊 Analytics Examples

### Example 12: Google Analytics Integration

```typescript
// lib/chatbot-config.ts
export const chatbotConfig = {
  analytics: {
    enabled: true,
    provider: "google",
    trackingId: "GA_MEASUREMENT_ID",
    events: {
      trackConversations: true,
      trackErrors: true,
      trackPerformance: true,
      trackUserSatisfaction: true,
    },
    privacy: {
      anonymizeIPs: true,
      respectDNT: true,
      dataRetentionDays: 90,
    },
  },
};
```

### Example 13: Custom Analytics Implementation

```typescript
// lib/chatbot-config.ts
export const chatbotConfig = {
  analytics: {
    enabled: true,
    provider: "custom",
    events: {
      trackConversations: true,
      trackErrors: true,
      trackPerformance: true,
    },
  },

  customization: {
    hooks: {
      afterReceive: `
        // Custom analytics tracking
        if (window.analytics) {
          window.analytics.track('Chatbot Message Received', {
            messageLength: message.content.length,
            responseTime: performance.now() - startTime,
            userId: user.id,
          });
        }
      `,
      onError: `
        // Error tracking
        if (window.Sentry) {
          window.Sentry.captureException(error, {
            tags: {
              component: 'chatbot',
              action: 'message_error',
            },
          });
        }
      `,
    },
  },
};
```

## 🔄 Update and Maintenance Examples

### Example 14: Updating Chatbot Installation

```bash
# Check for updates
ai-chatbot update

# Update with backup
ai-chatbot update --backup

# Force update (skip breaking change warnings)
ai-chatbot update --force

# Update to specific version
ai-chatbot update --version 2.1.0
```

### Example 15: Configuration Validation

```bash
# Validate current configuration
ai-chatbot validate

# Validate specific file
ai-chatbot validate ./lib/chatbot-config.ts

# Strict validation with auto-fix
ai-chatbot validate --strict --fix

# Validate and show detailed report
ai-chatbot validate --strict
```

**Validation Output:**
```
🤖 Validating AI Support Chatbot Configuration

📁 Validating: lib/chatbot-config.ts
✓ Configuration is valid!

⚠️  Warnings:
  • Environment variable GOOGLE_GENERATIVE_AI_API_KEY is not configured
  • Rate limit capacity is high (may allow abuse)

✅ Validation completed successfully!

📋 Configuration Summary:
  Name: Support Bot
  Version: 2.0.0
  AI Model: gemini-2.5-flash-lite
  Features: conversationHistory, suggestions, feedback
  Security: Enhanced
  Rate Limit: 10 requests per 60s
```

## 🎯 Template Management Examples

### Example 16: Working with Templates

```bash
# List all available templates
ai-chatbot templates list

# List templates for specific framework
ai-chatbot templates list --framework nextjs

# Get template information
ai-chatbot templates info nextjs-advanced

# Create custom template
ai-chatbot templates create my-ecommerce-bot --from nextjs-basic
```

### Example 17: Custom Template Creation

```bash
# Create template from existing project
ai-chatbot templates create my-template --from ./my-chatbot-project

# Create template from scratch
ai-chatbot templates create minimal-bot
```

**Custom Template Structure:**
```
templates/custom/my-template/
├── template.json              # Template metadata
├── components/
│   └── chatbot/
│       ├── index.tsx
│       ├── conversation.tsx
│       └── message.tsx
├── lib/
│   └── chatbot-config.ts
└── README.md
```

**template.json:**
```json
{
  "name": "my-template",
  "displayName": "My Custom Template",
  "description": "Custom e-commerce chatbot template",
  "framework": "nextjs",
  "features": [
    "product-search",
    "order-tracking",
    "customer-support"
  ],
  "custom": true,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

## 🚀 Production Deployment Examples

### Example 18: Environment Configuration

```bash
# .env.local (development)
NODE_ENV=development
GOOGLE_GENERATIVE_AI_API_KEY=your_dev_key
ARCJET_KEY=your_dev_arcjet_key
CHATBOT_DEBUG_CONFIG=true

# .env.production (production)
NODE_ENV=production
GOOGLE_GENERATIVE_AI_API_KEY=your_prod_key
ARCJET_KEY=your_prod_arcjet_key
CHATBOT_ANALYTICS_ENABLED=true
CHATBOT_MONITORING_ENABLED=true
```

### Example 19: Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  chatbot-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GOOGLE_GENERATIVE_AI_API_KEY=${GOOGLE_AI_KEY}
      - ARCJET_KEY=${ARCJET_KEY}
    restart: unless-stopped
```

## 🔍 Troubleshooting Examples

### Example 20: Common Issues and Solutions

**Issue: API Key Not Working**
```bash
# Validate configuration
ai-chatbot validate --strict

# Check environment variables
echo $GOOGLE_GENERATIVE_AI_API_KEY
```

**Issue: Rate Limiting Too Strict**
```bash
# Update rate limit configuration
ai-chatbot configure --interactive
# Select higher capacity and refill rate
```

**Issue: Chatbot Not Appearing**
```typescript
// Check if component is properly imported and rendered
import { Chatbot } from '@/components/chatbot';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        {/* Make sure Chatbot is included */}
        <Chatbot />
      </body>
    </html>
  );
}
```

These examples cover the most common use cases and scenarios you'll encounter when using the AI Support Chatbot CLI. For more specific questions, check the [main documentation](./README.md) or open an issue on GitHub.
