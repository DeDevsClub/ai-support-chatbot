#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { installCommand } from './commands/install';
import { configureCommand } from './commands/configure';
import { updateCommand } from './commands/update';
import { validateCommand } from './commands/validate';
import { templatesCommand } from './commands/templates';

const program = new Command();

program
  .name('ai-chatbot')
  .description('CLI tool for integrating AI Support Chatbot into existing codebases')
  .version('1.0.0')
  .addHelpText('before', chalk.cyan.bold('🤖 AI Support Chatbot CLI\n'))
  .addHelpText('after', `
${chalk.yellow('Examples:')}
  ${chalk.gray('$')} ai-chatbot init my-project
  ${chalk.gray('$')} ai-chatbot install --framework nextjs
  ${chalk.gray('$')} ai-chatbot configure --interactive
  ${chalk.gray('$')} ai-chatbot templates list

${chalk.yellow('Documentation:')}
  ${chalk.blue('https://github.com/DeDevsClub/ai-support-chatbot#cli')}
`);

// Initialize new chatbot project
program
  .command('init')
  .description('Initialize a new AI chatbot project')
  .argument('[name]', 'Project name')
  .option('-f, --framework <framework>', 'Target framework (nextjs, react, vue, angular, express)')
  .option('-t, --template <template>', 'Template to use')
  .option('-d, --directory <directory>', 'Target directory')
  .option('--no-install', 'Skip dependency installation')
  .option('--no-git', 'Skip git initialization')
  .action(initCommand);

// Install chatbot into existing project
program
  .command('install')
  .description('Install AI chatbot into existing project')
  .option('-f, --framework <framework>', 'Target framework (nextjs, react, vue, angular, express)')
  .option('-c, --config <config>', 'Configuration file path')
  .option('--interactive', 'Interactive installation')
  .option('--dry-run', 'Show what would be installed without making changes')
  .action(installCommand);

// Configure chatbot settings
program
  .command('configure')
  .description('Configure chatbot settings')
  .option('-c, --config <config>', 'Configuration file path')
  .option('--interactive', 'Interactive configuration')
  .option('--preset <preset>', 'Use configuration preset (basic, advanced, enterprise)')
  .option('--output <output>', 'Output configuration file path')
  .action(configureCommand);

// Update existing chatbot installation
program
  .command('update')
  .description('Update existing chatbot installation')
  .option('--version <version>', 'Target version')
  .option('--force', 'Force update even if breaking changes detected')
  .option('--backup', 'Create backup before updating')
  .action(updateCommand);

// Validate chatbot configuration
program
  .command('validate')
  .description('Validate chatbot configuration')
  .argument('[config]', 'Configuration file path')
  .option('--strict', 'Enable strict validation')
  .option('--fix', 'Attempt to fix validation errors')
  .action(validateCommand);

// Manage templates
program
  .command('templates')
  .description('Manage chatbot templates')
  .addCommand(
    new Command('list')
      .description('List available templates')
      .option('--framework <framework>', 'Filter by framework')
      .action(templatesCommand.list)
  )
  .addCommand(
    new Command('info')
      .description('Show template information')
      .argument('<template>', 'Template name')
      .action(templatesCommand.info)
  )
  .addCommand(
    new Command('create')
      .description('Create custom template')
      .argument('<name>', 'Template name')
      .option('--from <source>', 'Source template or directory')
      .action(templatesCommand.create)
  );

// Global error handler
process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ Unexpected error:'), error.message);
  if (process.env.DEBUG) {
    console.error(error.stack);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(chalk.red('❌ Unhandled promise rejection:'), reason);
  process.exit(1);
});

// Parse command line arguments
program.parse();
