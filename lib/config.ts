/**
 * Enhanced AI Chatbot Configuration System
 * 
 * This configuration system provides comprehensive customization options
 * with environment-based overrides, validation, and type safety.
 * 
 * @author AI Support Chatbot Template
 * @version 2.0.0
 */

import { z } from 'zod';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';
type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
type RateLimitStrategy = 'token-bucket' | 'sliding-window' | 'fixed-window';
type EncryptionAlgorithm = 'AES-256-GCM' | 'ChaCha20-Poly1305';
type AnalyticsProvider = 'google' | 'mixpanel' | 'amplitude' | 'custom';
type TrackMetrics = ('response_time' | 'error_rate' | 'user_satisfaction')[];
type Easing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const UIConfigSchema = z.object({
  windowTitle: z.string().min(1).max(100),
  inputPlaceholder: z.string().min(1).max(200),
  avatarImage: z.string().optional(),
  avatarFallback: z.string().min(1).max(10),
  theme: z.object({
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'xl']).default('md'),
    animation: z.object({
      enabled: z.boolean().default(true),
      duration: z.number().min(100).max(2000).default(300),
      easing: z.enum(['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out']).default('ease-out'),
    }).default({
      enabled: true,
      duration: 300,
      easing: 'ease-out'
    }),
  }).default({
    borderRadius: 'md',
    animation: {
      enabled: true,
      duration: 300,
      easing: 'ease-out'
    }
  }),
  positioning: z.object({
    mobile: z.object({
      fullscreen: z.boolean().default(true),
    }).default({
      fullscreen: true
    }),
    desktop: z.object({
      position: z.enum(['bottom-right', 'bottom-left', 'top-right', 'top-left']).default('bottom-right'),
      offset: z.object({
        x: z.number().min(0).max(100).default(20),
        y: z.number().min(0).max(100).default(20),
      }).default({
        x: 20,
        y: 20
      }),
      size: z.object({
        width: z.number().min(300).max(800).default(400),
        height: z.number().min(400).max(800).default(600),
      }).default({
        width: 400,
        height: 600
      }),
    }).default({
      position: 'bottom-right',
      offset: { x: 20, y: 20 },
      size: { width: 400, height: 600 }
    }),
  }).default({
    mobile: { fullscreen: true },
    desktop: {
      position: 'bottom-right',
      offset: { x: 20, y: 20 },
      size: { width: 400, height: 600 }
    }
  }),
});

const RateLimitConfigSchema = z.object({
  capacity: z.number().min(1).max(100).default(5),
  refillRate: z.number().min(1).max(50).default(2),
  interval: z.number().min(1).max(300).default(10),
  minTimeBetweenMessages: z.number().min(100).max(10000).default(1000),
  maxMessageLength: z.number().min(10).max(10000).default(1000),
  strategy: z.enum(['token-bucket', 'sliding-window', 'fixed-window']).default('token-bucket'),
  burstAllowance: z.number().min(0).max(10).default(2),
  gracePeriod: z.number().min(0).max(60).default(5),
});

const APIConfigSchema = z.object({
  model: z.string().min(1),
  systemPrompt: z.string().min(10),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(10).max(8192).default(2048),
  topP: z.number().min(0).max(1).default(0.9),
  frequencyPenalty: z.number().min(-2).max(2).default(0),
  presencePenalty: z.number().min(-2).max(2).default(0),
  timeout: z.number().min(1000).max(60000).default(30000),
  retries: z.object({
    maxAttempts: z.number().min(1).max(5).default(3),
    backoffMultiplier: z.number().min(1).max(5).default(2),
    initialDelay: z.number().min(100).max(5000).default(1000),
  }).default({
    maxAttempts: 3,
    backoffMultiplier: 2,
    initialDelay: 1000,
  }),
  streaming: z.object({
    enabled: z.boolean().default(true),
    bufferSize: z.number().min(1).max(100).default(10),
  }).default({
    enabled: true,
    bufferSize: 10,
  }),
});

const SecurityConfigSchema = z.object({
  enableBotDetection: z.boolean().default(true),
  enableShield: z.boolean().default(true),
  allowedBots: z.array(z.string()).default([]),
  contentFiltering: z.object({
    enabled: z.boolean().default(true),
    strictMode: z.boolean().default(false),
    customFilters: z.array(z.string()).default([]),
  }).default({
    enabled: true,
    strictMode: false,
    customFilters: [],
  }),
  cors: z.object({
    origins: z.array(z.string()).default(['*']),
    methods: z.array(z.string()).default(['GET', 'POST']),
    credentials: z.boolean().default(false),
  }).default({
    origins: ['*'],
    methods: ['GET', 'POST'],
    credentials: false,
  }),
  encryption: z.object({
    enabled: z.boolean().default(false),
    algorithm: z.enum(['AES-256-GCM', 'ChaCha20-Poly1305']).default('AES-256-GCM'),
  }).default({
    enabled: false,
    algorithm: 'AES-256-GCM',
  }),
});

const AnalyticsConfigSchema = z.object({
  enabled: z.boolean().default(false),
  provider: z.enum(['google', 'mixpanel', 'amplitude', 'custom']).optional(),
  trackingId: z.string().optional(),
  events: z.object({
    trackConversations: z.boolean().default(true),
    trackErrors: z.boolean().default(true),
    trackPerformance: z.boolean().default(false),
    trackUserSatisfaction: z.boolean().default(false),
  }).default({
    trackConversations: true,
    trackErrors: true,
    trackPerformance: false,
    trackUserSatisfaction: false,
  }),
  privacy: z.object({
    anonymizeIPs: z.boolean().default(true),
    respectDNT: z.boolean().default(true),
    dataRetentionDays: z.number().min(1).max(365).default(30),
  }).default({
    anonymizeIPs: true,
    respectDNT: true,
    dataRetentionDays: 30,
  }),
});

const I18nConfigSchema = z.object({
  enabled: z.boolean().default(false),
  defaultLocale: z.string().default('en'),
  supportedLocales: z.array(z.string()).default(['en']),
  fallbackLocale: z.string().default('en'),
  autoDetect: z.boolean().default(true),
  translations: z.record(z.string(), z.record(z.string(), z.string())).default({}),
});

const PerformanceConfigSchema = z.object({
  caching: z.object({
    enabled: z.boolean().default(true),
    ttl: z.number().min(60).max(86400).default(3600), // 1 hour
    maxSize: z.number().min(10).max(1000).default(100),
  }).default({
    enabled: true,
    ttl: 3600,
    maxSize: 100,
  }),
  optimization: z.object({
    lazyLoading: z.boolean().default(true),
    preloadMessages: z.number().min(0).max(50).default(10),
    debounceTyping: z.number().min(100).max(2000).default(300),
  }).default({
    lazyLoading: true,
    preloadMessages: 10,
    debounceTyping: 300,
  }),
  monitoring: z.object({
    enabled: z.boolean().default(false),
    sampleRate: z.number().min(0).max(1).default(0.1),
    trackMetrics: z.array(z.enum(['response_time', 'error_rate', 'user_satisfaction'])).default([]),
  }).default({
    enabled: false,
    sampleRate: 0.1,
    trackMetrics: [],
  }),
});

const ChatbotConfigSchema = z.object({
  name: z.string().min(1).max(100),
  version: z.string().default('2.0.0'),
  environment: z.enum(['development', 'production', 'test']).default('development'),
  welcomeMessage: z.string().min(1),
  ui: UIConfigSchema,
  rateLimit: RateLimitConfigSchema,
  api: APIConfigSchema,
  security: SecurityConfigSchema,
  analytics: AnalyticsConfigSchema.optional(),
  i18n: I18nConfigSchema.optional(),
  performance: PerformanceConfigSchema.optional(),
  features: z.object({
    conversationHistory: z.boolean().default(true),
    fileUpload: z.boolean().default(false),
    voiceInput: z.boolean().default(false),
    suggestions: z.boolean().default(true),
    feedback: z.boolean().default(true),
    export: z.boolean().default(false),
  }).default({
    conversationHistory: true,
    fileUpload: false,
    voiceInput: false,
    suggestions: true,
    feedback: true,
    export: false,
  }),
  customization: z.object({
    css: z.string().optional(),
    javascript: z.string().optional(),
    hooks: z.object({
      beforeSend: z.string().optional(),
      afterReceive: z.string().optional(),
      onError: z.string().optional(),
    }).default({}),
  }).default({
    hooks: {},
  }),
});

// =============================================================================
// ENVIRONMENT CONFIGURATION
// =============================================================================

/**
 * Get environment-specific configuration overrides
 */
function getEnvironmentConfig(): Partial<z.infer<typeof ChatbotConfigSchema>> {
  const env = process.env.NODE_ENV || 'development';
  
  const baseOverrides = {
    environment: env as 'development' | 'production' | 'test',
  };

  // Environment-specific overrides
  switch (env) {
    case 'production':
      return {
        ...baseOverrides,
        security: {
          enableBotDetection: true,
          enableShield: true,
          allowedBots: [],
          contentFiltering: {
            enabled: true,
            strictMode: true,
            customFilters: [],
          },
          cors: {
            origins: ['*'],
            methods: ['GET', 'POST'],
            credentials: false,
          },
          encryption: {
            enabled: false,
            algorithm: 'AES-256-GCM' as const,
          },
        },
        performance: {
          caching: {
            enabled: true,
            ttl: 3600,
            maxSize: 100,
          },
          optimization: {
            lazyLoading: true,
            preloadMessages: 10,
            debounceTyping: 300,
          },
          monitoring: {
            enabled: true,
            sampleRate: 0.1,
            trackMetrics: ['response_time', 'error_rate'] as const,
          },
        },
      };
    
    case 'test':
      return {
        ...baseOverrides,
        analytics: {
          enabled: true,
          provider: 'custom' as const,
          events: {
            trackConversations: true,
            trackErrors: true,
            trackPerformance: false,
            trackUserSatisfaction: false,
          },
          privacy: {
            anonymizeIPs: true,
            respectDNT: true,
            dataRetentionDays: 30,
          },
        },
      };
    
    default: // development
      return {
        ...baseOverrides,
        security: {
          enableBotDetection: false,
          enableShield: false,
          allowedBots: [],
          contentFiltering: {
            enabled: false,
            strictMode: false,
            customFilters: [],
          },
          cors: {
            origins: ['*'],
            methods: ['GET', 'POST'],
            credentials: false,
          },
          encryption: {
            enabled: false,
            algorithm: 'AES-256-GCM' as const,
          },
        },
        performance: {
          caching: {
            enabled: false,
            ttl: 3600,
            maxSize: 100,
          },
          optimization: {
            lazyLoading: true,
            preloadMessages: 10,
            debounceTyping: 300,
          },
          monitoring: {
            enabled: false,
            sampleRate: 0.1,
            trackMetrics: [],
          },
        },
      };
  }
}

// =============================================================================
// BASE CONFIGURATION
// =============================================================================

const baseConfig = {
  name: process.env.CHATBOT_NAME || "AI Assistant",
  version: "2.0.0",
  
  welcomeMessage: process.env.CHATBOT_WELCOME_MESSAGE || 
    "Hello! I'm your AI Assistant. What can I help you with today? {{choice:See Features}} {{link:https://github.com/DeDevsClub/create-next-chatbot|Source Code}}",

  ui: {
    windowTitle: process.env.CHATBOT_WINDOW_TITLE || "AI Assistant",
    inputPlaceholder: process.env.CHATBOT_INPUT_PLACEHOLDER || "Message AI Assistant...",
    avatarImage: process.env.CHATBOT_AVATAR_IMAGE || "/ai-avatar.png",
    avatarFallback: process.env.CHATBOT_AVATAR_FALLBACK || "AI",
    theme: {
      primaryColor: process.env.CHATBOT_PRIMARY_COLOR,
      borderRadius: (process.env.CHATBOT_BORDER_RADIUS as BorderRadius) || 'md',
      animation: {
        enabled: process.env.CHATBOT_ANIMATIONS !== 'false',
        duration: parseInt(process.env.CHATBOT_ANIMATION_DURATION || '300'),
        easing: (process.env.CHATBOT_ANIMATION_EASING as Easing) || 'ease-out',
      },
    },
    positioning: {
      mobile: {
        fullscreen: process.env.CHATBOT_MOBILE_FULLSCREEN !== 'false',
      },
      desktop: {
        position: (process.env.CHATBOT_DESKTOP_POSITION as Position) || 'bottom-right',
        offset: {
          x: parseInt(process.env.CHATBOT_DESKTOP_OFFSET_X || '20'),
          y: parseInt(process.env.CHATBOT_DESKTOP_OFFSET_Y || '20'),
        },
        size: {
          width: parseInt(process.env.CHATBOT_DESKTOP_WIDTH || '400'),
          height: parseInt(process.env.CHATBOT_DESKTOP_HEIGHT || '600'),
        },
      },
    },
  },

  rateLimit: {
    capacity: parseInt(process.env.CHATBOT_RATE_LIMIT_CAPACITY || '5'),
    refillRate: parseInt(process.env.CHATBOT_RATE_LIMIT_REFILL_RATE || '2'),
    interval: parseInt(process.env.CHATBOT_RATE_LIMIT_INTERVAL || '10'),
    minTimeBetweenMessages: parseInt(process.env.CHATBOT_MIN_TIME_BETWEEN_MESSAGES || '1000'),
    maxMessageLength: parseInt(process.env.CHATBOT_MAX_MESSAGE_LENGTH || '1000'),
    strategy: (process.env.CHATBOT_RATE_LIMIT_STRATEGY as RateLimitStrategy) || 'token-bucket',
    burstAllowance: parseInt(process.env.CHATBOT_BURST_ALLOWANCE || '2'),
    gracePeriod: parseInt(process.env.CHATBOT_GRACE_PERIOD || '5'),
  },

  api: {
    model: process.env.CHATBOT_AI_MODEL || "gemini-2.5-flash-lite",
    temperature: parseFloat(process.env.CHATBOT_AI_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.CHATBOT_AI_MAX_TOKENS || '2048'),
    topP: parseFloat(process.env.CHATBOT_AI_TOP_P || '0.9'),
    frequencyPenalty: parseFloat(process.env.CHATBOT_AI_FREQUENCY_PENALTY || '0'),
    presencePenalty: parseFloat(process.env.CHATBOT_AI_PRESENCE_PENALTY || '0'),
    timeout: parseInt(process.env.CHATBOT_AI_TIMEOUT || '30000'),
    
    systemPrompt: process.env.CHATBOT_SYSTEM_PROMPT || `You are a helpful AI assistant on a website. Help users understand the product, which is an open source AI chatbot template. 
    You are a version of this chatbot. The AI is built with Next.js (with tailwind for full customization), Vercel AI SDK, and Google Gemini. 
    It can be used by developers for many purposes, including customer support, knowledge base, and sales leads. 
    Provide clear, concise, and accurate responses to relevant questions and requests only. 
    You have been enchanted by the Enchantress. The source code, documentation, and setup can be found at https://github.com/DeDevsClub/create-next-chatbot

    The features include:
    - Arcjet protection for rate limiting and bot protection
    - Free AI models built with Gemini AI's API free tier
    - Users can customize the chatbot's responses
    
    When appropriate, you can use these formats. Put it at the bottom of the response with no punctuation:
    - {{choice:Option Name}} - Creates clickable choice buttons
    - {{link:https://url.com|Button Text}} - Creates clickable link buttons
    `,
    
    retries: {
      maxAttempts: parseInt(process.env.CHATBOT_AI_MAX_RETRIES || '3'),
      backoffMultiplier: parseFloat(process.env.CHATBOT_AI_BACKOFF_MULTIPLIER || '2'),
      initialDelay: parseInt(process.env.CHATBOT_AI_INITIAL_DELAY || '1000'),
    },
    
    streaming: {
      enabled: process.env.CHATBOT_AI_STREAMING !== 'false',
      bufferSize: parseInt(process.env.CHATBOT_AI_BUFFER_SIZE || '10'),
    },
  },

  security: {
    enableBotDetection: process.env.CHATBOT_ENABLE_BOT_DETECTION !== 'false',
    enableShield: process.env.CHATBOT_ENABLE_SHIELD !== 'false',
    allowedBots: process.env.CHATBOT_ALLOWED_BOTS ? process.env.CHATBOT_ALLOWED_BOTS.split(',') : [],
    
    contentFiltering: {
      enabled: process.env.CHATBOT_CONTENT_FILTERING !== 'false',
      strictMode: process.env.CHATBOT_CONTENT_FILTERING_STRICT === 'true',
      customFilters: process.env.CHATBOT_CUSTOM_FILTERS ? process.env.CHATBOT_CUSTOM_FILTERS.split(',') : [],
    },
    
    cors: {
      origins: process.env.CHATBOT_CORS_ORIGINS ? process.env.CHATBOT_CORS_ORIGINS.split(',') : ['*'],
      methods: process.env.CHATBOT_CORS_METHODS ? process.env.CHATBOT_CORS_METHODS.split(',') : ['GET', 'POST'],
      credentials: process.env.CHATBOT_CORS_CREDENTIALS === 'true',
    },
    
    encryption: {
      enabled: process.env.CHATBOT_ENCRYPTION_ENABLED === 'true',
      algorithm: (process.env.CHATBOT_ENCRYPTION_ALGORITHM as EncryptionAlgorithm) || 'AES-256-GCM',
    },
  },

  analytics: {
    enabled: process.env.CHATBOT_ANALYTICS_ENABLED === 'true',
    provider: process.env.CHATBOT_ANALYTICS_PROVIDER as AnalyticsProvider,
    trackingId: process.env.CHATBOT_ANALYTICS_TRACKING_ID,
    
    events: {
      trackConversations: process.env.CHATBOT_TRACK_CONVERSATIONS !== 'false',
      trackErrors: process.env.CHATBOT_TRACK_ERRORS !== 'false',
      trackPerformance: process.env.CHATBOT_TRACK_PERFORMANCE === 'true',
      trackUserSatisfaction: process.env.CHATBOT_TRACK_USER_SATISFACTION === 'true',
    },
    
    privacy: {
      anonymizeIPs: process.env.CHATBOT_ANONYMIZE_IPS !== 'false',
      respectDNT: process.env.CHATBOT_RESPECT_DNT !== 'false',
      dataRetentionDays: parseInt(process.env.CHATBOT_DATA_RETENTION_DAYS || '90'),
    },
  },

  i18n: {
    enabled: process.env.CHATBOT_I18N_ENABLED === 'true',
    defaultLocale: process.env.CHATBOT_DEFAULT_LOCALE || 'en',
    supportedLocales: process.env.CHATBOT_SUPPORTED_LOCALES ? process.env.CHATBOT_SUPPORTED_LOCALES.split(',') : ['en'],
    fallbackLocale: process.env.CHATBOT_FALLBACK_LOCALE || 'en',
    autoDetect: process.env.CHATBOT_AUTO_DETECT_LOCALE !== 'false',
    translations: {}, // Load from external files in production
  },

  performance: {
    caching: {
      enabled: process.env.CHATBOT_CACHING_ENABLED !== 'false',
      ttl: parseInt(process.env.CHATBOT_CACHE_TTL || '3600'),
      maxSize: parseInt(process.env.CHATBOT_CACHE_MAX_SIZE || '100'),
    },
    
    optimization: {
      lazyLoading: process.env.CHATBOT_LAZY_LOADING !== 'false',
      preloadMessages: parseInt(process.env.CHATBOT_PRELOAD_MESSAGES || '10'),
      debounceTyping: parseInt(process.env.CHATBOT_DEBOUNCE_TYPING || '300'),
    },
    
    monitoring: {
      enabled: process.env.CHATBOT_MONITORING_ENABLED === 'true',
      sampleRate: parseFloat(process.env.CHATBOT_MONITORING_SAMPLE_RATE || '0.1'),
      trackMetrics: process.env.CHATBOT_TRACK_METRICS ? process.env.CHATBOT_TRACK_METRICS.split(',') as TrackMetrics : [],
    },
  },

  features: {
    conversationHistory: process.env.CHATBOT_CONVERSATION_HISTORY !== 'false',
    fileUpload: process.env.CHATBOT_FILE_UPLOAD === 'true',
    voiceInput: process.env.CHATBOT_VOICE_INPUT === 'true',
    suggestions: process.env.CHATBOT_SUGGESTIONS !== 'false',
    feedback: process.env.CHATBOT_FEEDBACK !== 'false',
    export: process.env.CHATBOT_EXPORT === 'true',
  },

  customization: {
    css: process.env.CHATBOT_CUSTOM_CSS,
    javascript: process.env.CHATBOT_CUSTOM_JS,
    hooks: {
      beforeSend: process.env.CHATBOT_HOOK_BEFORE_SEND,
      afterReceive: process.env.CHATBOT_HOOK_AFTER_RECEIVE,
      onError: process.env.CHATBOT_HOOK_ON_ERROR,
    },
  },
};

// =============================================================================
// CONFIGURATION FACTORY
// =============================================================================

/**
 * Create and validate the chatbot configuration
 */
function createChatbotConfig() {
  try {
    // Merge base config with environment overrides
    const envOverrides = getEnvironmentConfig();
    const mergedConfig = { ...baseConfig, ...envOverrides };
    
    // Validate the configuration
    const validatedConfig = ChatbotConfigSchema.parse(mergedConfig);
    
    return validatedConfig;
  } catch (error) {
    console.error('❌ Chatbot configuration validation failed:', error);
    
    // In development, throw the error to help with debugging
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
    
    // In production, fall back to a minimal safe configuration
    console.warn('⚠️  Falling back to minimal safe configuration');
    return ChatbotConfigSchema.parse({
      name: "AI Assistant",
      welcomeMessage: "Hello! How can I help you today?",
      ui: {
        windowTitle: "AI Assistant",
        inputPlaceholder: "Type your message...",
        avatarFallback: "AI",
      },
      api: {
        model: "gemini-2.5-flash-lite",
        systemPrompt: "You are a helpful AI assistant.",
      },
    });
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * The main chatbot configuration object
 * Automatically validates and applies environment overrides
 */
export const chatbotConfig = createChatbotConfig();

/**
 * TypeScript type for the chatbot configuration
 */
export type ChatbotConfig = z.infer<typeof ChatbotConfigSchema>;

/**
 * Configuration validation schema (for external validation)
 */
export { ChatbotConfigSchema };

/**
 * Utility function to validate partial configuration updates
 */
export function validateConfigUpdate(update: Partial<ChatbotConfig>): Partial<ChatbotConfig> {
  return ChatbotConfigSchema.partial().parse(update);
}

/**
 * Utility function to get configuration for a specific environment (for testing)
 */
export function getConfigForEnvironment(env: 'development' | 'test' | 'production'): ChatbotConfig {
  // Create a mock environment configuration without mutating process.env
  const mockEnvConfig = (() => {
    switch (env) {
      case 'production':
        return {
          environment: env,
          security: {
            enableBotDetection: true,
            enableShield: true,
            allowedBots: [],
            contentFiltering: {
              enabled: true,
              strictMode: true,
              customFilters: [],
            },
            cors: {
              origins: ['*'],
              methods: ['GET', 'POST'],
              credentials: false,
            },
            encryption: {
              enabled: false,
              algorithm: 'AES-256-GCM' as const,
            },
          },
        };
      case 'test':
        return {
          environment: env,
          analytics: {
            enabled: true,
            provider: 'custom' as const,
            events: {
              trackConversations: true,
              trackErrors: true,
              trackPerformance: false,
              trackUserSatisfaction: false,
            },
            privacy: {
              anonymizeIPs: true,
              respectDNT: true,
              dataRetentionDays: 30,
            },
          },
        };
      default:
        return { environment: env };
    }
  })();

  const mergedConfig = { ...baseConfig, ...mockEnvConfig };
  return ChatbotConfigSchema.parse(mergedConfig);
}

/**
 * Development helper to log current configuration
 */
if (process.env.NODE_ENV === 'development' && process.env.CHATBOT_DEBUG_CONFIG === 'true') {
  console.log('🤖 Chatbot Configuration:', JSON.stringify(chatbotConfig, null, 2));
}
