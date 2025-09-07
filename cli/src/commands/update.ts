import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import semver from 'semver';
import { detectProjectInfo, installDependencies } from '../utils';
import { ErrorMessage } from '../types';

interface UpdateOptions {
  version?: string;
  force?: boolean;
  backup?: boolean;
}

export async function updateCommand(options: UpdateOptions = {}): Promise<void> {
  console.log(chalk.cyan.bold('🤖 Updating AI Support Chatbot\n'));

  const currentDir = process.cwd();
  
  // Detect existing installation
  const spinner = ora('Checking for existing chatbot installation...').start();
  const projectInfo = await detectProjectInfo(currentDir);
  
  if (!projectInfo) {
    spinner.fail('No package.json found in current directory');
    process.exit(1);
  }

  // Check for chatbot dependencies
  const chatbotDeps = [
    '@ai-sdk/google',
    '@ai-sdk/react',
    'ai',
    '@arcjet/next',
    'zod',
    'clsx',
    'tailwind-merge',
    'class-variance-authority',
    'lucide-react',
    'react-markdown',
    'use-stick-to-bottom',
  ];

  const installedChatbotDeps = chatbotDeps.filter(dep => 
    projectInfo.dependencies[dep] || projectInfo.devDependencies[dep]
  );

  if (installedChatbotDeps.length === 0) {
    spinner.fail('No AI Support Chatbot installation detected');
    console.log(chalk.yellow('Use "ai-chatbot install" to install the chatbot first.'));
    process.exit(1);
  }

  spinner.succeed(`Found chatbot installation with ${installedChatbotDeps.length} dependencies`);

  // Get current versions
  const packageJsonPath = path.join(currentDir, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);
  
  console.log(chalk.blue('\n📦 Current Versions:'));
  installedChatbotDeps.forEach(dep => {
    const version = packageJson.dependencies[dep] || packageJson.devDependencies[dep];
    console.log(`  ${dep}: ${chalk.white(version)}`);
  });

  // Get latest versions (simplified - in real implementation would fetch from npm)
  const latestVersions: Record<string, string> = {
    '@ai-sdk/google': '^2.0.12',
    '@ai-sdk/react': '^2.0.34',
    'ai': '^5.0.34',
    '@arcjet/next': '1.0.0-beta.11',
    'zod': '^3.22.4',
    'clsx': '^2.1.1',
    'tailwind-merge': '^3.3.1',
    'class-variance-authority': '^0.7.1',
    'lucide-react': '^0.542.0',
    'react-markdown': '^10.1.0',
    'use-stick-to-bottom': '^1.1.1',
  };

  // Check for updates
  const updatesAvailable: Array<{ name: string; current: string; latest: string; breaking: boolean }> = [];
  
  installedChatbotDeps.forEach(dep => {
    const current = packageJson.dependencies[dep] || packageJson.devDependencies[dep];
    const latest = latestVersions[dep];
    
    if (latest && current !== latest) {
      const currentClean = semver.clean(current.replace(/[\^~]/, ''));
      const latestClean = semver.clean(latest.replace(/[\^~]/, ''));
      
      if (currentClean && latestClean && semver.gt(latestClean, currentClean)) {
        const breaking = semver.major(latestClean) > semver.major(currentClean);
        updatesAvailable.push({
          name: dep,
          current,
          latest,
          breaking,
        });
      }
    }
  });

  if (updatesAvailable.length === 0) {
    console.log(chalk.green('\n✅ All dependencies are up to date!'));
    return;
  }

  console.log(chalk.blue('\n📋 Updates Available:'));
  updatesAvailable.forEach(update => {
    const icon = update.breaking ? '⚠️ ' : '📦';
    const label = update.breaking ? ' (BREAKING)' : '';
    console.log(`  ${icon} ${update.name}: ${chalk.gray(update.current)} → ${chalk.green(update.latest)}${chalk.red(label)}`);
  });

  // Check for breaking changes
  const breakingChanges = updatesAvailable.filter(u => u.breaking);
  if (breakingChanges.length > 0 && !options.force) {
    console.log(chalk.yellow('\n⚠️  Breaking changes detected:'));
    breakingChanges.forEach(change => {
      console.log(`  • ${change.name}: Major version update`);
    });
    
    const { confirmBreaking } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmBreaking',
        message: 'Continue with breaking changes? (This may require code modifications)',
        default: false,
      },
    ]);
    
    if (!confirmBreaking) {
      console.log(chalk.yellow('Update cancelled.'));
      return;
    }
  }

  // Create backup if requested
  if (options.backup) {
    const backupSpinner = ora('Creating backup...').start();
    try {
      const backupDir = path.join(currentDir, '.chatbot-backup');
      await fs.ensureDir(backupDir);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `backup-${timestamp}`);
      
      // Backup key files
      const filesToBackup = [
        'package.json',
        'lib/chatbot-config.ts',
        'lib/config.ts',
        'components/chatbot',
        '.env.local',
      ];
      
      for (const file of filesToBackup) {
        const sourcePath = path.join(currentDir, file);
        if (await fs.pathExists(sourcePath)) {
          const targetPath = path.join(backupPath, file);
          await fs.copy(sourcePath, targetPath);
        }
      }
      
      backupSpinner.succeed(`Backup created at ${path.relative(currentDir, backupPath)}`);
    } catch (error: unknown) {
      backupSpinner.fail('Backup creation failed');
      console.error(chalk.red('Error:'), (error as ErrorMessage).message);
      
      const { continueWithoutBackup } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueWithoutBackup',
          message: 'Continue update without backup?',
          default: false,
        },
      ]);
      
      if (!continueWithoutBackup) {
        process.exit(1);
      }
    }
  }

  // Perform updates
  const updateSpinner = ora('Updating dependencies...').start();
  
  try {
    // Update package.json
    updatesAvailable.forEach(update => {
      if (packageJson.dependencies[update.name]) {
        packageJson.dependencies[update.name] = update.latest;
      } else if (packageJson.devDependencies[update.name]) {
        packageJson.devDependencies[update.name] = update.latest;
      }
    });
    
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    
    // Install updated dependencies
    await installDependencies(currentDir, projectInfo.packageManager);
    
    updateSpinner.succeed('Dependencies updated successfully');
    
    // Check for configuration updates
    await checkConfigurationUpdates(currentDir);
    
    console.log(chalk.green.bold('\n🎉 Update completed successfully!\n'));
    
    if (breakingChanges.length > 0) {
      console.log(chalk.yellow('⚠️  Breaking Changes Notice:'));
      console.log(chalk.gray('  Some dependencies had major version updates.'));
      console.log(chalk.gray('  Please review your code and test thoroughly.'));
      console.log(chalk.gray('  Check the changelog for migration guides:'));
      breakingChanges.forEach(change => {
        console.log(chalk.gray(`    • ${change.name}: Check npm page for migration guide`));
      });
    }
    
    console.log(chalk.blue('\n📚 Next Steps:'));
    console.log(chalk.gray('  1. Test your chatbot functionality'));
    console.log(chalk.gray('  2. Review any breaking change documentation'));
    console.log(chalk.gray('  3. Update your configuration if needed'));
    
  } catch (error: unknown) {
    updateSpinner.fail('Update failed');
    console.error(chalk.red('Error:'), (error as ErrorMessage).message);
    
    if (options.backup) {
      console.log(chalk.yellow('\n💡 You can restore from backup if needed:'));
      console.log(chalk.gray('  Check the .chatbot-backup directory'));
    }
    
    process.exit(1);
  }
}

async function checkConfigurationUpdates(projectDir: string): Promise<void> {
  const configPaths = [
    'lib/chatbot-config.ts',
    'lib/config.ts',
    'src/lib/chatbot-config.ts',
    'src/lib/config.ts',
  ];
  
  let configPath: string | null = null;
  
  for (const possiblePath of configPaths) {
    const fullPath = path.join(projectDir, possiblePath);
    if (await fs.pathExists(fullPath)) {
      configPath = fullPath;
      break;
    }
  }
  
  if (!configPath) {
    return;
  }
  
  try {
    const configContent = await fs.readFile(configPath, 'utf-8');
    
    // Check for outdated configuration patterns
    const outdatedPatterns = [
      { pattern: /chatbotConfig\s*=\s*{/, suggestion: 'Consider using the new configuration schema' },
      { pattern: /version:\s*["']1\./, suggestion: 'Update version to 2.0.0 for latest features' },
    ];
    
    const issues = outdatedPatterns.filter(({ pattern }) => pattern.test(configContent));
    
    if (issues.length > 0) {
      console.log(chalk.yellow('\n⚠️  Configuration Update Suggestions:'));
      issues.forEach(issue => {
        console.log(chalk.gray(`  • ${issue.suggestion}`));
      });
      console.log(chalk.gray('  Run "ai-chatbot configure --interactive" to update'));
    }
    
  } catch (error) {
    // Ignore config parsing errors
  }
}
