import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import { z } from 'zod';
import { ErrorMessage } from '../types';

interface ValidateOptions {
  strict?: boolean;
  fix?: boolean;
}

// Validation schemas
const ChatbotConfigSchema = z.object({
  name: z.string().min(1).max(100),
  version: z.string(),
  welcomeMessage: z.string().min(1),
  ui: z.object({
    windowTitle: z.string().min(1),
    inputPlaceholder: z.string().min(1),
    avatarFallback: z.string().min(1).max(10),
    theme: z.object({
      primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'xl']),
      animation: z.object({
        enabled: z.boolean(),
        duration: z.number().min(100).max(2000),
        easing: z.string(),
      }),
    }),
    positioning: z.object({
      mobile: z.object({
        fullscreen: z.boolean(),
      }),
      desktop: z.object({
        position: z.enum(['bottom-right', 'bottom-left', 'top-right', 'top-left']),
        offset: z.object({
          x: z.number().min(0).max(100),
          y: z.number().min(0).max(100),
        }),
        size: z.object({
          width: z.number().min(300).max(800),
          height: z.number().min(400).max(800),
        }),
      }),
    }),
  }),
  features: z.object({
    conversationHistory: z.boolean(),
    fileUpload: z.boolean(),
    voiceInput: z.boolean(),
    suggestions: z.boolean(),
    feedback: z.boolean(),
    export: z.boolean(),
  }),
  api: z.object({
    model: z.string().min(1),
    systemPrompt: z.string().min(10),
    temperature: z.number().min(0).max(2),
    maxTokens: z.number().min(10).max(8192),
    timeout: z.number().min(1000).max(60000),
  }),
  security: z.object({
    enableBotDetection: z.boolean(),
    enableShield: z.boolean(),
    contentFiltering: z.object({
      enabled: z.boolean(),
      strictMode: z.boolean(),
    }),
  }),
  rateLimit: z.object({
    capacity: z.number().min(1).max(100),
    refillRate: z.number().min(1).max(50),
    interval: z.number().min(1).max(300),
  }),
});

export async function validateCommand(configPath?: string, options: ValidateOptions = {}): Promise<void> {
  console.log(chalk.cyan.bold('🤖 Validating AI Support Chatbot Configuration\n'));

  const currentDir = process.cwd();
  
  // Find configuration file
  const configPaths = [
    configPath,
    'lib/chatbot-config.ts',
    'src/lib/chatbot-config.ts',
    'lib/config.ts',
    'src/lib/config.ts',
    'chatbot.config.ts',
    'chatbot.config.js',
  ].filter(Boolean);

  let foundConfigPath: string | null = null;
  
  for (const possiblePath of configPaths) {
    const fullPath = path.resolve(currentDir, possiblePath!);
    if (await fs.pathExists(fullPath)) {
      foundConfigPath = fullPath;
      break;
    }
  }

  if (!foundConfigPath) {
    console.error(chalk.red('❌ No configuration file found'));
    console.log(chalk.gray('Searched in:'));
    configPaths.slice(1).forEach(p => console.log(chalk.gray(`  • ${p}`)));
    console.log(chalk.yellow('\nRun "ai-chatbot configure" to create a configuration file.'));
    process.exit(1);
  }

  console.log(chalk.blue(`📁 Validating: ${path.relative(currentDir, foundConfigPath)}`));

  const spinner = ora('Parsing configuration...').start();
  
  try {
    // Read and parse configuration
    const configContent = await fs.readFile(foundConfigPath, 'utf-8');
    const config = extractConfigFromFile(configContent);
    
    spinner.text = 'Validating configuration schema...';
    
    // Validate against schema
    const validationResult = ChatbotConfigSchema.safeParse(config);
    
    if (validationResult.success) {
      spinner.succeed('Configuration is valid!');
      
      // Additional checks
      const warnings = await performAdditionalChecks(config, currentDir, options.strict);
      
      if (warnings.length > 0) {
        console.log(chalk.yellow('\n⚠️  Warnings:'));
        warnings.forEach(warning => {
          console.log(chalk.yellow(`  • ${warning}`));
        });
      }
      
      console.log(chalk.green.bold('\n✅ Validation completed successfully!'));
      
      // Show configuration summary
      showConfigurationSummary(validationResult.data);
      
    } else {
      spinner.fail('Configuration validation failed');
      
      console.log(chalk.red('\n❌ Validation Errors:'));
      validationResult.error.errors.forEach(error => {
        const path = error.path.join('.');
        console.log(chalk.red(`  • ${path}: ${error.message}`));
      });
      
      if (options.fix) {
        await attemptAutoFix(foundConfigPath, validationResult.error.errors, config);
      } else {
        console.log(chalk.yellow('\n💡 Use --fix flag to attempt automatic fixes'));
      }
      
      process.exit(1);
    }
    
  } catch (error: unknown) {
    spinner.fail('Failed to parse configuration');
    console.error(chalk.red('Error:'), (error as ErrorMessage).message);
    
    if ((error as ErrorMessage).message.includes('JSON') || (error as ErrorMessage).message.includes('parse')) {
      console.log(chalk.yellow('\n💡 Configuration file may have syntax errors'));
      console.log(chalk.gray('  • Check for missing commas, quotes, or brackets'));
      console.log(chalk.gray('  • Ensure valid TypeScript/JavaScript syntax'));
    }
    
    process.exit(1);
  }
}

async function performAdditionalChecks(config: any, projectDir: string, strict?: boolean): Promise<string[]> {
  const warnings: string[] = [];
  
  // Check for environment variables
  const envPath = path.join(projectDir, '.env.local');
  if (await fs.pathExists(envPath)) {
    const envContent = await fs.readFile(envPath, 'utf-8');
    
    const requiredEnvVars = [
      'GOOGLE_GENERATIVE_AI_API_KEY',
      'ARCJET_KEY',
    ];
    
    requiredEnvVars.forEach(envVar => {
      if (!envContent.includes(envVar) || envContent.includes(`${envVar}=your_`)) {
        warnings.push(`Environment variable ${envVar} is not configured`);
      }
    });
  } else {
    warnings.push('No .env.local file found - API keys may not be configured');
  }
  
  // Check package.json dependencies
  const packageJsonPath = path.join(projectDir, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const requiredDeps = [
      '@ai-sdk/google',
      'ai',
      'zod',
    ];
    
    requiredDeps.forEach(dep => {
      if (!allDeps[dep]) {
        warnings.push(`Required dependency ${dep} is missing`);
      }
    });
    
    // Check for conflicting versions
    if (allDeps['@ai-sdk/google'] && allDeps['ai']) {
      // In a real implementation, would check version compatibility
    }
  }
  
  // Strict mode checks
  if (strict) {
    // Check for security best practices
    if (!config.security?.enableBotDetection) {
      warnings.push('Bot detection is disabled (security risk)');
    }
    
    if (!config.security?.enableShield) {
      warnings.push('Content shield is disabled (security risk)');
    }
    
    if (config.rateLimit?.capacity > 10) {
      warnings.push('Rate limit capacity is high (may allow abuse)');
    }
    
    // Check for performance optimizations
    if (config.api?.maxTokens > 4000) {
      warnings.push('Max tokens is high (may impact performance)');
    }
    
    if (config.ui?.theme?.animation?.duration > 500) {
      warnings.push('Animation duration is high (may impact UX)');
    }
  }
  
  return warnings;
}

async function attemptAutoFix(configPath: string, errors: any[], config: any): Promise<void> {
  console.log(chalk.blue('\n🔧 Attempting automatic fixes...\n'));
  
  let fixedConfig = { ...config };
  let fixCount = 0;
  
  for (const error of errors) {
    const path = error.path.join('.');
    
    switch (error.code) {
      case 'invalid_type':
        if (error.expected === 'boolean' && typeof error.received === 'string') {
          const value = error.received.toLowerCase();
          if (value === 'true' || value === 'false') {
            setNestedProperty(fixedConfig, error.path, value === 'true');
            console.log(chalk.green(`  ✓ Fixed ${path}: converted string to boolean`));
            fixCount++;
          }
        }
        break;
        
      case 'too_small':
        if (error.type === 'string' && error.minimum === 1) {
          setNestedProperty(fixedConfig, error.path, 'Default Value');
          console.log(chalk.green(`  ✓ Fixed ${path}: added default value`));
          fixCount++;
        }
        break;
        
      case 'invalid_enum_value': {
        const validOptions = error.options;
        if (validOptions.length > 0) {
          setNestedProperty(fixedConfig, error.path, validOptions[0]);
          console.log(chalk.green(`  ✓ Fixed ${path}: set to ${validOptions[0]}`));
          fixCount++;
        }
        break;
      }
    }
  }
  
  if (fixCount > 0) {
    // Generate new configuration file
    const newConfigContent = generateConfigFile(fixedConfig);
    
    // Create backup
    const backupPath = `${configPath}.backup`;
    await fs.copy(configPath, backupPath);
    console.log(chalk.gray(`  📁 Backup created: ${path.basename(backupPath)}`));
    
    // Write fixed configuration
    await fs.writeFile(configPath, newConfigContent);
    
    console.log(chalk.green(`\n✅ Applied ${fixCount} automatic fixes`));
    console.log(chalk.yellow('⚠️  Please review the changes and test your configuration'));
  } else {
    console.log(chalk.yellow('❌ No automatic fixes available'));
    console.log(chalk.gray('  Manual intervention required for these errors'));
  }
}

function showConfigurationSummary(config: any): void {
  console.log(chalk.blue('\n📋 Configuration Summary:'));
  console.log(`  Name: ${chalk.white(config.name)}`);
  console.log(`  Version: ${chalk.white(config.version)}`);
  console.log(`  AI Model: ${chalk.white(config.api.model)}`);
  console.log(`  Features: ${chalk.white(Object.entries(config.features).filter(([, enabled]) => enabled).map(([name]) => name).join(', '))}`);
  console.log(`  Security: ${chalk.white(config.security.enableBotDetection ? 'Enhanced' : 'Basic')}`);
  console.log(`  Rate Limit: ${chalk.white(`${config.rateLimit.capacity} requests per ${config.rateLimit.interval}s`)}`);
}

function extractConfigFromFile(content: string): any {
  // Simplified config extraction - in real implementation would use AST parsing
  try {
    // Remove TypeScript types and extract the config object
    const configMatch = content.match(/(?:export\s+)?(?:const|let|var)\s+\w*[Cc]onfig\s*=\s*({[\s\S]*?});/);
    if (configMatch) {
      // This is a very simplified approach - real implementation would use proper AST parsing
      const configStr = configMatch[1];
      // Convert to JSON-like format (simplified)
      const jsonStr = configStr
        .replace(/(\w+):/g, '"$1":')
        .replace(/'/g, '"')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');
      
      return JSON.parse(jsonStr);
    }
  } catch (error) {
    // Fallback to basic extraction
  }
  
  // Fallback: extract basic properties
  const config: any = {};
  
  const extractValue = (key: string, type: 'string' | 'number' | 'boolean' = 'string') => {
    const regex = new RegExp(`${key}:\\s*([^,\\n}]+)`, 'i');
    const match = content.match(regex);
    if (match) {
      let value = match[1].trim().replace(/['"]/g, '');
      if (type === 'number') return parseFloat(value);
      if (type === 'boolean') return value === 'true';
      return value;
    }
    return undefined;
  };
  
  config.name = extractValue('name');
  config.version = extractValue('version');
  config.welcomeMessage = extractValue('welcomeMessage');
  
  return config;
}

function generateConfigFile(config: any): string {
  return `/**
 * AI Support Chatbot Configuration
 * Auto-fixed by create-next-chatbot
 */

export const chatbotConfig = ${JSON.stringify(config, null, 2)} as const;

export type ChatbotConfig = typeof chatbotConfig;
`;
}

function setNestedProperty(obj: any, path: (string | number)[], value: any): void {
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }
  current[path[path.length - 1]] = value;
}
