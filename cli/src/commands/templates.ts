import path from 'node:path';
import fs from 'fs-extra';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
// import { glob } from 'glob';
import type { Template, Framework } from '../types';
import { getAvailableFrameworks } from '../utils';

interface TemplatesCommands {
  list: (options: { framework?: string }) => Promise<void>;
  info: (templateName: string) => Promise<void>;
  create: (name: string, options: { from?: string }) => Promise<void>;
}

export const templatesCommand: TemplatesCommands = {
  list: listTemplates,
  info: showTemplateInfo,
  create: createTemplate,
};

async function listTemplates(options: { framework?: string } = {}): Promise<void> {
  console.log(chalk.cyan.bold('🤖 Available Chatbot Templates\n'));

  const templatesDir = path.join(__dirname, '../../templates');
  const frameworks = getAvailableFrameworks();
  
  if (options.framework) {
    const framework = frameworks.find(f => f.name === options.framework);
    if (!framework) {
      console.error(chalk.red(`❌ Unknown framework: ${options.framework}`));
      process.exit(1);
    }
    
    console.log(chalk.blue(`📋 Templates for ${framework.displayName}:\n`));
    await showFrameworkTemplates(framework);
  } else {
    console.log(chalk.blue('📋 All Available Templates:\n'));
    
    for (const framework of frameworks) {
      console.log(chalk.white.bold(`${framework.displayName} (${framework.name})`));
      await showFrameworkTemplates(framework, '  ');
      console.log();
    }
  }

  console.log(chalk.blue('📚 Usage:'));
  console.log(chalk.gray('  ai-chatbot init --framework nextjs --template basic'));
  console.log(chalk.gray('  ai-chatbot templates info nextjs-advanced'));
  console.log(chalk.gray('  ai-chatbot templates create my-template --from nextjs-basic'));
}

async function showFrameworkTemplates(framework: Framework, indent: string = ''): Promise<void> {
  const templates = getTemplatesForFramework(framework.name);
  
  if (templates.length === 0) {
    console.log(chalk.gray(`${indent}No templates available`));
    return;
  }

  templates.forEach(template => {
    console.log(`${indent}${chalk.green('●')} ${chalk.white(template.name)} - ${chalk.gray(template.description)}`);
    if (template.features.length > 0) {
      console.log(`${indent}  ${chalk.blue('Features:')} ${template.features.join(', ')}`);
    }
  });
}

async function showTemplateInfo(templateName: string): Promise<void> {
  console.log(chalk.cyan.bold(`🤖 Template Information: ${templateName}\n`));

  const template = await findTemplate(templateName);
  if (!template) {
    console.error(chalk.red(`❌ Template not found: ${templateName}`));
    console.log(chalk.yellow('Use "ai-chatbot templates list" to see available templates'));
    process.exit(1);
  }

  console.log(chalk.blue('📋 Template Details:'));
  console.log(`  Name: ${chalk.white(template.name)}`);
  console.log(`  Framework: ${chalk.white(template.framework)}`);
  console.log(`  Description: ${chalk.white(template.description)}`);
  
  if (template.features.length > 0) {
    console.log(`  Features: ${chalk.white(template.features.join(', '))}`);
  }

  console.log(chalk.blue('\n📁 Template Files:'));
  template.files.forEach(file => {
    const icon = file.type === 'directory' ? '📁' : '📄';
    console.log(`  ${icon} ${file.path}`);
  });

  console.log(chalk.blue('\n📚 Usage:'));
  console.log(chalk.gray(`  ai-chatbot init my-project --framework ${template.framework} --template ${template.name}`));
  console.log(chalk.gray(`  ai-chatbot install --framework ${template.framework}`));
}

async function createTemplate(name: string, options: { from?: string } = {}): Promise<void> {
  console.log(chalk.cyan.bold(`🤖 Creating Custom Template: ${name}\n`));

  const templatesDir = path.join(__dirname, '../../templates');
  const customTemplatesDir = path.join(templatesDir, 'custom');
  const targetPath = path.join(customTemplatesDir, name);

  // Check if template already exists
  if (await fs.pathExists(targetPath)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `Template "${name}" already exists. Overwrite?`,
        default: false,
      },
    ]);
    
    if (!overwrite) {
      console.log(chalk.yellow('Template creation cancelled.'));
      return;
    }
  }

  let sourceTemplate: Template | null = null;
  let sourcePath: string;

  if (options.from) {
    // Copy from existing template
    sourceTemplate = await findTemplate(options.from);
    if (sourceTemplate) {
      sourcePath = path.join(templatesDir, sourceTemplate.framework, options.from);
    } else {
      // Try as directory path
      sourcePath = path.resolve(options.from);
      if (!await fs.pathExists(sourcePath)) {
        console.error(chalk.red(`❌ Source template or directory not found: ${options.from}`));
        process.exit(1);
      }
    }
  } else {
    // Interactive template creation
    const { framework, baseTemplate } = await inquirer.prompt([
      {
        type: 'list',
        name: 'framework',
        message: 'Which framework is this template for?',
        choices: getAvailableFrameworks().map(f => ({
          name: f.displayName,
          value: f.name,
        })),
      },
      {
        type: 'list',
        name: 'baseTemplate',
        message: 'Base template to copy from:',
        choices: [
          { name: 'Start from scratch', value: null },
          { name: 'Copy from existing template', value: 'existing' },
        ],
      },
    ]);

    if (baseTemplate === 'existing') {
      const templates = getTemplatesForFramework(framework);
      const { selectedTemplate } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedTemplate',
          message: 'Select base template:',
          choices: templates.map(t => ({
            name: `${t.name} - ${t.description}`,
            value: t.name,
          })),
        },
      ]);
      
      sourceTemplate = templates.find(t => t.name === selectedTemplate) || null;
      sourcePath = path.join(templatesDir, framework, selectedTemplate);
    } else {
      // Create minimal template structure
      sourcePath = path.join(templatesDir, framework, 'basic');
    }
  }

  const spinner = ora('Creating template...').start();

  try {
    await fs.ensureDir(targetPath);

    if (await fs.pathExists(sourcePath)) {
      // Copy source template
      await fs.copy(sourcePath, targetPath);
    } else {
      // Create basic structure
      await createBasicTemplateStructure(targetPath);
    }

    // Create template metadata
    const templateMeta = {
      name,
      displayName: name.charAt(0).toUpperCase() + name.slice(1),
      description: `Custom template: ${name}`,
      framework: sourceTemplate?.framework || 'nextjs',
      features: sourceTemplate?.features || ['basic'],
      custom: true,
      createdAt: new Date().toISOString(),
    };

    await fs.writeJson(path.join(targetPath, 'template.json'), templateMeta, { spaces: 2 });

    spinner.succeed('Template created successfully');

    console.log(chalk.green.bold('\n🎉 Custom template created!\n'));
    
    console.log(chalk.blue('📁 Template Location:'));
    console.log(chalk.gray(`  ${path.relative(process.cwd(), targetPath)}`));
    
    console.log(chalk.blue('\n📚 Usage:'));
    console.log(chalk.gray(`  ai-chatbot init my-project --template ${name}`));
    
    console.log(chalk.blue('\n✏️  Customization:'));
    console.log(chalk.gray('  1. Edit files in the template directory'));
    console.log(chalk.gray('  2. Use {{VARIABLE_NAME}} for template variables'));
    console.log(chalk.gray('  3. Update template.json with metadata'));

  } catch (error: any) {
    spinner.fail('Template creation failed');
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

function getTemplatesForFramework(frameworkName: string): Template[] {
  // In a real implementation, this would scan the templates directory
  // For now, return predefined templates
  const templates: Record<string, Template[]> = {
    nextjs: [
      {
        name: 'basic',
        displayName: 'Basic Next.js Chatbot',
        description: 'Simple chatbot with essential features',
        framework: 'nextjs',
        features: ['conversation-history', 'rate-limiting', 'responsive-ui'],
        files: [
          { path: 'components/chatbot/index.tsx', content: '', type: 'file' },
          { path: 'components/chatbot/conversation.tsx', content: '', type: 'file' },
          { path: 'components/chatbot/message.tsx', content: '', type: 'file' },
          { path: 'app/api/chat/route.ts', content: '', type: 'file' },
          { path: 'lib/chatbot-config.ts', content: '', type: 'file' },
        ],
      },
      {
        name: 'advanced',
        displayName: 'Advanced Next.js Chatbot',
        description: 'Full-featured chatbot with file upload and voice input',
        framework: 'nextjs',
        features: ['conversation-history', 'file-upload', 'voice-input', 'export', 'analytics'],
        files: [
          { path: 'components/chatbot/index.tsx', content: '', type: 'file' },
          { path: 'components/chatbot/conversation.tsx', content: '', type: 'file' },
          { path: 'components/chatbot/message.tsx', content: '', type: 'file' },
          { path: 'components/chatbot/file-upload.tsx', content: '', type: 'file' },
          { path: 'components/chatbot/voice-input.tsx', content: '', type: 'file' },
          { path: 'app/api/chat/route.ts', content: '', type: 'file' },
          { path: 'lib/chatbot-config.ts', content: '', type: 'file' },
        ],
      },
    ],
    react: [
      {
        name: 'basic',
        displayName: 'Basic React Chatbot',
        description: 'Simple React chatbot with Vite',
        framework: 'react',
        features: ['conversation-history', 'responsive-ui'],
        files: [
          { path: 'src/components/chatbot/index.tsx', content: '', type: 'file' },
          { path: 'src/components/chatbot/conversation.tsx', content: '', type: 'file' },
          { path: 'src/components/chatbot/message.tsx', content: '', type: 'file' },
          { path: 'src/lib/chatbot-config.ts', content: '', type: 'file' },
        ],
      },
    ],
    vue: [
      {
        name: 'basic',
        displayName: 'Basic Vue Chatbot',
        description: 'Simple Vue.js chatbot',
        framework: 'vue',
        features: ['conversation-history', 'responsive-ui'],
        files: [
          { path: 'src/components/chatbot/ChatBot.vue', content: '', type: 'file' },
          { path: 'src/components/chatbot/Conversation.vue', content: '', type: 'file' },
          { path: 'src/components/chatbot/Message.vue', content: '', type: 'file' },
          { path: 'src/lib/chatbot-config.ts', content: '', type: 'file' },
        ],
      },
    ],
    angular: [
      {
        name: 'basic',
        displayName: 'Basic Angular Chatbot',
        description: 'Simple Angular chatbot',
        framework: 'angular',
        features: ['conversation-history', 'responsive-ui'],
        files: [
          { path: 'src/app/chatbot/chatbot.component.ts', content: '', type: 'file' },
          { path: 'src/app/chatbot/chatbot.component.html', content: '', type: 'file' },
          { path: 'src/app/chatbot/chatbot.component.scss', content: '', type: 'file' },
          { path: 'src/app/chatbot/chatbot.service.ts', content: '', type: 'file' },
        ],
      },
    ],
    express: [
      {
        name: 'basic',
        displayName: 'Basic Express API',
        description: 'Simple Express.js API for chatbot',
        framework: 'express',
        features: ['rest-api', 'rate-limiting', 'cors'],
        files: [
          { path: 'src/index.ts', content: '', type: 'file' },
          { path: 'src/routes/chat.ts', content: '', type: 'file' },
          { path: 'src/middleware/rateLimiter.ts', content: '', type: 'file' },
          { path: 'src/config/chatbot.ts', content: '', type: 'file' },
        ],
      },
    ],
  };

  return templates[frameworkName] || [];
}

async function findTemplate(templateName: string): Promise<Template | null> {
  const frameworks = getAvailableFrameworks();
  
  for (const framework of frameworks) {
    const templates = getTemplatesForFramework(framework.name);
    const template = templates.find(t => t.name === templateName || `${framework.name}-${t.name}` === templateName);
    if (template) {
      return template;
    }
  }
  
  return null;
}

async function createBasicTemplateStructure(templatePath: string): Promise<void> {
  const basicFiles = [
    'components/chatbot/index.tsx',
    'components/chatbot/conversation.tsx',
    'components/chatbot/message.tsx',
    'lib/chatbot-config.ts',
    'README.md',
  ];

  for (const file of basicFiles) {
    const filePath = path.join(templatePath, file);
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, `// ${file}\n// TODO: Implement ${path.basename(file, path.extname(file))} component\n`);
  }
}
