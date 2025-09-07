# AI Support Chatbot CLI

A powerful command-line interface for integrating AI Support Chatbot into existing codebases with customizable options and framework-specific templates.

## 🚀 Quick Start

```bash
# Install globally
npm install -g create-next-chatbot

# Create a new chatbot project
ai-chatbot init my-chatbot --framework nextjs

# Install into existing project
cd my-existing-project
ai-chatbot install --interactive

# Configure chatbot settings
ai-chatbot configure --interactive
```

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g create-next-chatbot
```

### Local Installation

```bash
npm install --save-dev create-next-chatbot
npx ai-chatbot --help
```

## 🛠️ Commands

### `init` - Create New Project

Initialize a new AI chatbot project from scratch.

```bash
ai-chatbot init [name] [options]
```

**Options:**
- `-f, --framework <framework>` - Target framework (nextjs, react, vue, angular, express)
- `-t, --template <template>` - Template to use
- `-d, --directory <directory>` - Target directory
- `--no-install` - Skip dependency installation
- `--no-git` - Skip git initialization

**Examples:**
```bash
# Interactive setup
ai-chatbot init

# Quick setup with Next.js
ai-chatbot init my-chatbot --framework nextjs

# Custom directory
ai-chatbot init my-chatbot --directory ./projects/chatbot

# Skip dependency installation
ai-chatbot init my-chatbot --no-install
```

### `install` - Add to Existing Project

Install AI chatbot components into an existing project.

```bash
ai-chatbot install [options]
```

**Options:**
- `-f, --framework <framework>` - Target framework
- `-c, --config <config>` - Configuration file path
- `--interactive` - Interactive installation
- `--dry-run` - Show what would be installed without making changes

**Examples:**
```bash
# Interactive installation
ai-chatbot install --interactive

# Install for specific framework
ai-chatbot install --framework nextjs

# Dry run to see changes
ai-chatbot install --dry-run
```

### `configure` - Configure Settings

Configure chatbot settings and behavior.

```bash
ai-chatbot configure [options]
```

**Options:**
- `-c, --config <config>` - Configuration file path
- `--interactive` - Interactive configuration
- `--preset <preset>` - Use configuration preset (basic, advanced, enterprise)
- `--output <output>` - Output configuration file path

**Examples:**
```bash
# Interactive configuration
ai-chatbot configure --interactive

# Use preset
ai-chatbot configure --preset advanced

# Custom config file
ai-chatbot configure --config ./my-config.ts --interactive
```

### `update` - Update Installation

Update existing chatbot installation to the latest version.

```bash
ai-chatbot update [options]
```

**Options:**
- `--version <version>` - Target version
- `--force` - Force update even if breaking changes detected
- `--backup` - Create backup before updating

**Examples:**
```bash
# Update to latest
ai-chatbot update

# Update with backup
ai-chatbot update --backup

# Force update
ai-chatbot update --force
```

### `validate` - Validate Configuration

Validate chatbot configuration for errors and best practices.

```bash
ai-chatbot validate [config] [options]
```

**Options:**
- `--strict` - Enable strict validation
- `--fix` - Attempt to fix validation errors

**Examples:**
```bash
# Validate default config
ai-chatbot validate

# Validate specific file
ai-chatbot validate ./lib/chatbot-config.ts

# Strict validation with auto-fix
ai-chatbot validate --strict --fix
```

### `templates` - Manage Templates

Manage chatbot templates for different frameworks and use cases.

```bash
ai-chatbot templates <command>
```

**Subcommands:**
- `list [--framework <framework>]` - List available templates
- `info <template>` - Show template information
- `create <name> [--from <source>]` - Create custom template

**Examples:**
```bash
# List all templates
ai-chatbot templates list

# List Next.js templates
ai-chatbot templates list --framework nextjs

# Show template info
ai-chatbot templates info nextjs-advanced

# Create custom template
ai-chatbot templates create my-template --from nextjs-basic
```

## 🎯 Supported Frameworks

### Next.js
- **App Router** support
- Server and client components
- API routes with streaming
- Built-in security with Arcjet
- Tailwind CSS styling

### React (Vite)
- Modern React with hooks
- Vite for fast development
- TypeScript support
- Component-based architecture

### Vue.js
- Vue 3 Composition API
- TypeScript support
- Vite build system
- Reactive components

### Angular
- Angular 15+ support
- TypeScript by default
- Angular CLI integration
- Service-based architecture

### Express.js
- REST API endpoints
- Middleware support
- CORS configuration
- Rate limiting

## 🔧 Configuration

### Configuration Presets

#### Basic
- Essential features only
- Minimal security
- Simple UI
- Perfect for development

#### Advanced
- Full feature set
- Enhanced security
- Rich UI components
- Production-ready

#### Enterprise
- Maximum security
- All features enabled
- Strict validation
- Audit logging

### Environment Variables

```bash
# Required
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
ARCJET_KEY=your_arcjet_key_here

# Optional
CHATBOT_NAME="My AI Assistant"
CHATBOT_WELCOME_MESSAGE="Hello! How can I help?"
CHATBOT_PRIMARY_COLOR="#3B82F6"
CHATBOT_ANALYTICS_ENABLED=true
```

### Configuration File Structure

```typescript
export const chatbotConfig = {
  name: "AI Assistant",
  version: "2.0.0",
  welcomeMessage: "Hello! How can I help you today?",
  
  ui: {
    windowTitle: "AI Assistant",
    inputPlaceholder: "Type your message...",
    theme: {
      primaryColor: "#3B82F6",
      borderRadius: "md",
      animation: {
        enabled: true,
        duration: 300,
        easing: "ease-out",
      },
    },
    positioning: {
      desktop: {
        position: "bottom-right",
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
    systemPrompt: "You are a helpful AI assistant...",
    temperature: 0.7,
    maxTokens: 2048,
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
  },
};
```

## 🔐 Security Features

### Arcjet Integration
- **Rate Limiting**: Token bucket algorithm
- **Bot Detection**: Automated bot filtering
- **Content Shield**: Malicious content protection
- **IP Filtering**: Geographic and reputation-based blocking

### Content Filtering
- Inappropriate content detection
- Custom filter patterns
- Strict mode for enhanced filtering
- Real-time content analysis

### API Security
- Request validation
- Input sanitization
- Error handling
- Timeout protection

## 🎨 Customization

### UI Theming
```typescript
ui: {
  theme: {
    primaryColor: "#3B82F6",
    borderRadius: "lg",
    animation: {
      enabled: true,
      duration: 400,
      easing: "ease-in-out",
    },
  },
}
```

### Custom CSS
```typescript
customization: {
  css: `
    .chatbot-container {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
  `,
}
```

### Custom Hooks
```typescript
customization: {
  hooks: {
    beforeSend: "validateMessage",
    afterReceive: "logResponse",
    onError: "handleError",
  },
}
```

## 📊 Analytics & Monitoring

### Supported Providers
- Google Analytics
- Mixpanel
- Amplitude
- Custom analytics

### Tracked Events
- Conversation starts
- Message exchanges
- Error occurrences
- User satisfaction
- Performance metrics

### Privacy Features
- IP anonymization
- DNT (Do Not Track) respect
- Data retention controls
- GDPR compliance

## 🌍 Internationalization

### Multi-language Support
```typescript
i18n: {
  enabled: true,
  defaultLocale: "en",
  supportedLocales: ["en", "es", "fr", "de"],
  autoDetect: true,
}
```

### Translation Management
- JSON-based translations
- Dynamic locale switching
- Fallback language support
- RTL language support

## 🚀 Performance Optimization

### Caching
- Response caching
- Asset optimization
- CDN integration
- Memory management

### Lazy Loading
- Component splitting
- Dynamic imports
- Progressive enhancement
- Bandwidth optimization

## 🧪 Testing

### Unit Tests
```bash
cd cli
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Development Setup
```bash
git clone https://github.com/DeDevsClub/create-next-chatbot.git
cd create-next-chatbot/cli
npm install
npm run dev
```

## 📝 License

MIT License - see [LICENSE](../LICENSE) for details.

## 🆘 Support

- **Documentation**: [GitHub Wiki](https://github.com/DeDevsClub/create-next-chatbot/wiki)
- **Issues**: [GitHub Issues](https://github.com/DeDevsClub/create-next-chatbot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/DeDevsClub/create-next-chatbot/discussions)
- **Discord**: [Join our community](https://discord.gg/dedevsclub)

## 🗺️ Roadmap

- [ ] Plugin system
- [ ] Visual configuration editor
- [ ] More AI providers
- [ ] Advanced analytics
- [ ] Mobile SDK
- [ ] WordPress plugin
- [ ] Shopify integration

---

Made with ❤️ by [DeDevsClub](https://github.com/DeDevsClub)
