# AI Support Chatbot Template

A modern, customizable AI chatbot built with Next.js 15, Vercel AI SDK, and Google Gemini. Features a beautiful dark theme, rate limiting, bot protection, and seamless integration capabilities with a powerful CLI for easy deployment.

## ✨ Features

- 🤖 **AI-Powered**: Google Gemini 2.5 Flash integration with streaming responses
- 🎨 **Modern Dark UI**: Beautiful gradient backgrounds with glass-morphism effects
- 🛡️ **Security First**: Arcjet protection with rate limiting and bot detection
- 📱 **Responsive Design**: Works perfectly on desktop and mobile
- ⚡ **Real-time Streaming**: Live response streaming with typing indicators
- 🔧 **Highly Customizable**: Easy configuration and theming
- 🚀 **Production Ready**: Built with Next.js 15 and React 19
- 💬 **Interactive Elements**: Support for clickable choices and external links
- 🛠️ **CLI Integration**: Powerful command-line tool for seamless integration into existing projects

## 🚀 Quick Start

### Option 1: Using the CLI (Recommended)

The fastest way to get started is using our CLI tool:

```bash
# Install the CLI globally
npm install -g @dedevsclub/ai-chatbot-cli

# Create a new chatbot project
ai-chatbot init my-chatbot --framework nextjs

# Or install into existing project
cd my-existing-project
ai-chatbot install --interactive
```

### Option 2: Manual Setup

### 1. Clone and Install

```bash
git clone https://github.com/DeDevsClub/ai-support-chatbot.git
cd ai-support-chatbot
pnpm install
```

### 2. Environment Setup

Create a `.env.local` file and add your API keys:

```env
# Arcjet key from https://app.arcjet.com
ARCJET_KEY=your_arcjet_key_here

# Google Gemini API key from https://aistudio.google.com/app/apikey
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

# Next.js app URL (for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` to see your chatbot in action!

## 🔧 Integration Instructions

### Option 1: Use as Standalone Application

The chatbot works out-of-the-box as a complete Next.js application with a landing page and integrated chat interface.

### Option 2: Integrate into Existing Project

#### Step 1: Copy Core Components

Copy these essential files to your project:

```
components/chatbot/
├── index.tsx           # Main chatbot wrapper
├── conversation.tsx    # Chat conversation display
├── message.tsx         # Individual message components
└── prompt-input.tsx    # Input field and controls

lib/
├── config.ts          # Chatbot configuration
└── arcjet.ts          # Security configuration

app/api/chat/
└── route.ts           # Chat API endpoint
```

#### Step 2: Install Dependencies

```bash
npm install @ai-sdk/google @ai-sdk/react @arcjet/next framer-motion use-stick-to-bottom react-markdown @iconify/react
```

#### Step 3: Add Environment Variables

```env
ARCJET_KEY=your_arcjet_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
NEXT_PUBLIC_APP_URL=your_app_url
```

#### Step 4: Import and Use

```tsx
import ChatBotWrapper from '@/components/chatbot'

export default function YourPage() {
  return (
    <div>
      {/* Your existing content */}
      <ChatBotWrapper />
    </div>
  )
}
```

### Option 3: Customize Integration

#### Programmatic Control

```tsx
import { ChatBot } from '@/components/chatbot'

export default function CustomIntegration() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Chat
      </button>
      
      {isOpen && (
        <ChatBot onClose={() => setIsOpen(false)} />
      )}
    </>
  )
}
```

#### Custom Trigger Button

```tsx
import { useState } from 'react'
import { ChatBot } from '@/components/chatbot'
import { MessageSquareIcon } from 'lucide-react'

export default function CustomTrigger() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      {/* Your custom trigger */}
      <div className="fixed bottom-4 right-4">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
        >
          <MessageSquareIcon className="w-6 h-6" />
        </button>
      </div>
      
      {isOpen && <ChatBot onClose={() => setIsOpen(false)} />}
    </>
  )
}
```

## ⚙️ Configuration

### Basic Configuration

Edit `lib/config.ts` to customize your chatbot:

```typescript
export const chatbotConfig = {
  // Basic info
  name: "AI Assistant",
  
  // Welcome message (supports {{choice:}} and {{link:}} syntax)
  welcomeMessage: "Hello! I'm your AI Assistant. What can I help you with today?",
  
  // UI customization
  ui: {
    windowTitle: "AI Assistant",
    inputPlaceholder: "Type your message...",
    avatarImage: "/avatar.png",
    avatarFallback: "AI",
  },
  
  // Rate limiting
  rateLimit: {
    capacity: 10,        // Bucket maximum capacity
    refillRate: 2,       // Tokens refilled per interval
    interval: 10,        // Refill interval in seconds
    minTimeBetweenMessages: 1000, // Min ms between messages
    maxMessageLength: 1000,       // Max characters per message
  },
  
  // AI configuration
  api: {
    model: "gemini-2.0-flash-exp",
    systemPrompt: "You are a helpful AI assistant. Be concise and friendly.",
  },
  
  // Security settings
  security: {
    enableBotDetection: true,
    enableShield: true,
    allowedBots: [], // Empty array blocks all bots
  },
};
```

### Advanced Customization

#### Interactive Elements

The chatbot supports special syntax for interactive elements:

```typescript
// Clickable choices
welcomeMessage: "How can I help? {{choice:Get Support}} {{choice:Learn More}} {{choice:Contact Sales}}"

// External links
welcomeMessage: "Check out our {{link:https://docs.example.com|Documentation}} or {{link:https://github.com/example|GitHub}}"
```

#### Custom System Prompt

Modify the `systemPrompt` in `lib/config.ts` to change AI behavior:

```typescript
systemPrompt: `You are a customer service assistant for [Your Company]. 
Be helpful, professional, and friendly. When appropriate, use:
- {{choice:Option Name}} for clickable choices
- {{link:https://url.com|Button Text}} for external links

Always end responses with relevant next steps.`
```

#### Rate Limiting Configuration

Fine-tune rate limiting in `lib/config.ts`:

- **capacity**: Maximum requests in burst (default: 10)
- **refillRate**: Tokens added per interval (default: 2)
- **interval**: Refill frequency in seconds (default: 10)
- **minTimeBetweenMessages**: Minimum ms between messages (default: 1000)
- **maxMessageLength**: Maximum characters per message (default: 1000)

#### Security Settings

Configure Arcjet security features:

- **enableBotDetection**: Block automated bots
- **enableShield**: Protect against common attacks  
- **allowedBots**: Specify allowed bot categories (empty array blocks all)

## 🎨 UI Customization

### Dark Theme Styling

The chatbot features a modern dark theme with:
- **Background**: `from-gray-950 to-black` gradients
- **Cards**: Glass-morphism effects with `backdrop-blur-sm`
- **Text**: High contrast white text (`text-gray-100`)
- **Interactive Elements**: Consistent hover states

### Key Styling Files

```
app/globals.css              # Global styles and CSS variables
components/ui/               # Shadcn UI components
components/chatbot/
├── index.tsx               # Main chatbot with dark theme
├── message.tsx             # Message bubbles and avatars
├── conversation.tsx        # Chat container and scroll
└── prompt-input.tsx        # Input field styling
```

### Custom Avatar

1. Add your avatar image to the `public/` folder
2. Update the path in `lib/config.ts`:

```typescript
ui: {
  avatarImage: "/your-avatar.png",
  avatarFallback: "AI", // Fallback text if image fails
}
```

### Theming

Customize colors by modifying Tailwind classes in components:

```tsx
// Example: Change accent color from gray to blue
className="bg-blue-950 text-blue-100 hover:bg-blue-900"
```

## 🔧 Technical Details

### Architecture

- **Frontend**: Next.js 15 with App Router and React 19
- **AI**: Vercel AI SDK with Google Gemini 2.0 Flash
- **Security**: Arcjet for rate limiting and bot protection
- **Styling**: Tailwind CSS with Shadcn UI components
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Iconify React for consistent iconography

### Key Features

- ✅ **Streaming Responses**: Real-time AI response streaming
- ✅ **Rate Limiting**: Token bucket algorithm with Arcjet
- ✅ **Bot Protection**: Automated bot detection and blocking
- ✅ **Mobile Responsive**: Adaptive UI for all screen sizes
- ✅ **Dark Theme**: Modern glass-morphism design
- ✅ **TypeScript**: Full type safety throughout
- ✅ **Error Handling**: Graceful error recovery and retry logic
- ✅ **Interactive Elements**: Clickable choices and external links
- ✅ **Accessibility**: ARIA labels and keyboard navigation

### File Structure

```
├── app/
│   ├── api/chat/route.ts    # Chat API endpoint with Arcjet protection
│   ├── page.tsx             # Main landing page
│   ├── layout.tsx           # Root layout with metadata
│   └── globals.css          # Global styles and Tailwind
├── components/
│   ├── chatbot/
│   │   ├── index.tsx        # Main chatbot wrapper and logic
│   │   ├── conversation.tsx # Chat display and scroll management
│   │   ├── message.tsx      # Individual message components
│   │   └── prompt-input.tsx # Input field and submit controls
│   ├── ui/                  # Shadcn UI components (Button, Card, etc.)
│   ├── bento-grid.tsx       # Feature showcase grid
│   ├── features-grid.tsx    # Features section
│   └── landing.tsx          # Landing page component
├── lib/
│   ├── config.ts            # Chatbot configuration
│   ├── arcjet.ts            # Security and rate limiting setup
│   ├── features.tsx         # Feature definitions
│   └── utils.ts             # Utility functions
└── public/                  # Static assets (AI avatar image)
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `ARCJET_KEY`
   - `GOOGLE_GENERATIVE_AI_API_KEY`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy automatically!

### Other Platforms

The chatbot works on any platform that supports Next.js:

- **Netlify**: Add build command `pnpm build` and publish directory `out`
- **Railway**: Connect GitHub repo and add environment variables
- **DigitalOcean App Platform**: Use Node.js buildpack
- **AWS Amplify**: Connect repository and configure build settings

## 🛠️ Development

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

### Environment Variables

Required for development:

```env
# Development
ARCJET_KEY=ajkey_test_...                    # Test key for development
GOOGLE_GENERATIVE_AI_API_KEY=AIza...         # Your Gemini API key
NEXT_PUBLIC_APP_URL=http://localhost:3000    # Local development URL
```

### Testing

```bash
# Run type checking
pnpm type-check

# Format code
pnpm format

# Check formatting
pnpm format:check
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vercel AI SDK](https://sdk.vercel.ai/) for AI integration
- [Google Gemini](https://ai.google.dev/) for the AI model
- [Arcjet](https://arcjet.com/) for security and rate limiting
- [Shadcn UI](https://ui.shadcn.com/) for beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations

## 📞 Support

- 📧 Email: [support@dedevs.com](mailto:support@dedevs.com)
- 🐛 Issues: [GitHub Issues](https://github.com/DeDevsClub/ai-support-chatbot/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/DeDevsClub/ai-support-chatbot/discussions)
- 🌐 Website: [DeDevs.com](https://dedevs.com)

---

Made with 🩷 and ☕ by [DeDevs](https://dedevs.com)

MIT License - feel free to use this template for your projects!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you have questions or need help:
- Open an issue on GitHub
- Review the example configuration

---

**Happy coding!** 🎉