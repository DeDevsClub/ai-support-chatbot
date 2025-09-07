import path from "node:path";
import fs from "fs-extra";
import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import type { ConfigureOptions, ChatbotConfig, ErrorMessage } from "../types";

// Configuration presets
const PRESETS = {
	basic: {
		name: "Basic",
		description: "Simple chatbot with essential features",
		config: {
			features: {
				conversationHistory: true,
				fileUpload: false,
				voiceInput: false,
				suggestions: true,
				feedback: false,
				export: false,
			},
			ui: {
				theme: {
					borderRadius: "md" as const,
					animation: {
						enabled: true,
						duration: 300,
						easing: "ease-out",
					},
				},
			},
			security: {
				enableBotDetection: false,
				enableShield: false,
				contentFiltering: {
					enabled: false,
					strictMode: false,
				},
			},
		},
	},
	advanced: {
		name: "Advanced",
		description: "Full-featured chatbot with enhanced capabilities",
		config: {
			features: {
				conversationHistory: true,
				fileUpload: true,
				voiceInput: true,
				suggestions: true,
				feedback: true,
				export: true,
			},
			ui: {
				theme: {
					borderRadius: "lg" as const,
					animation: {
						enabled: true,
						duration: 400,
						easing: "ease-in-out",
					},
				},
			},
			security: {
				enableBotDetection: true,
				enableShield: true,
				contentFiltering: {
					enabled: true,
					strictMode: false,
				},
			},
		},
	},
	enterprise: {
		name: "Enterprise",
		description: "Production-ready with maximum security and features",
		config: {
			features: {
				conversationHistory: true,
				fileUpload: true,
				voiceInput: true,
				suggestions: true,
				feedback: true,
				export: true,
			},
			ui: {
				theme: {
					borderRadius: "sm" as const,
					animation: {
						enabled: true,
						duration: 200,
						easing: "ease-out",
					},
				},
			},
			security: {
				enableBotDetection: true,
				enableShield: true,
				contentFiltering: {
					enabled: true,
					strictMode: true,
				},
			},
		},
	},
};

export async function configureCommand(
	options: ConfigureOptions = {},
): Promise<void> {
	console.log(chalk.cyan.bold("🤖 Configuring AI Support Chatbot\n"));

	const currentDir = process.cwd();

	// Find existing configuration
	const configPaths = [
		options.config,
		"lib/chatbot-config.ts",
		"src/lib/chatbot-config.ts",
		"lib/config.ts",
		"src/lib/config.ts",
		"chatbot.config.ts",
		"chatbot.config.js",
	].filter(Boolean);

	let configPath: string | null = null;
	let existingConfig: Partial<ChatbotConfig> = {};

	for (const possiblePath of configPaths) {
		const fullPath = path.resolve(currentDir, possiblePath!);
		if (await fs.pathExists(fullPath)) {
			configPath = fullPath;
			break;
		}
	}

	if (configPath) {
		console.log(
			chalk.blue(
				`📁 Found existing configuration: ${path.relative(currentDir, configPath)}`,
			),
		);
		try {
			// Try to read existing config (simplified - in real implementation would parse TS/JS)
			const configContent = await fs.readFile(configPath, "utf-8");
			// This is a simplified extraction - real implementation would use AST parsing
			existingConfig = extractConfigFromFile(configContent);
		} catch (error) {
			console.log(
				chalk.yellow(
					"⚠️  Could not parse existing configuration, starting fresh",
				),
			);
		}
	} else {
		console.log(
			chalk.yellow("📁 No existing configuration found, creating new one"),
		);
		configPath = path.resolve(currentDir, "lib/chatbot-config.ts");
	}

	// Interactive configuration
	if (options.interactive) {
		await interactiveConfiguration(configPath, existingConfig, options);
	} else if (options.preset) {
		await presetConfiguration(
			configPath,
			options.preset,
			existingConfig,
			options,
		);
	} else {
		console.log(
			chalk.yellow(
				"No configuration method specified. Use --interactive or --preset",
			),
		);
		console.log(chalk.gray("Available presets: basic, advanced, enterprise"));
		process.exit(1);
	}
}

async function interactiveConfiguration(
	configPath: string,
	existingConfig: Partial<ChatbotConfig>,
	options: ConfigureOptions,
): Promise<void> {
	console.log(chalk.blue("🎛️  Interactive Configuration\n"));

	// Basic settings
	const basicSettings = await inquirer.prompt([
		{
			type: "input",
			name: "name",
			message: "Chatbot name:",
			default: existingConfig.name || "AI Assistant",
		},
		{
			type: "input",
			name: "welcomeMessage",
			message: "Welcome message:",
			default:
				existingConfig.welcomeMessage || "Hello! How can I help you today?",
		},
		{
			type: "input",
			name: "windowTitle",
			message: "Chat window title:",
			default: existingConfig.ui?.windowTitle || "AI Assistant",
		},
		{
			type: "input",
			name: "inputPlaceholder",
			message: "Input placeholder text:",
			default: existingConfig.ui?.inputPlaceholder || "Type your message...",
		},
	]);

	// Features
	const features = await inquirer.prompt([
		{
			type: "checkbox",
			name: "enabledFeatures",
			message: "Select features to enable:",
			choices: [
				{
					name: "Conversation History",
					value: "conversationHistory",
					checked: existingConfig.features?.conversationHistory ?? true,
				},
				{
					name: "File Upload Support",
					value: "fileUpload",
					checked: existingConfig.features?.fileUpload ?? false,
				},
				{
					name: "Voice Input",
					value: "voiceInput",
					checked: existingConfig.features?.voiceInput ?? false,
				},
				{
					name: "Smart Suggestions",
					value: "suggestions",
					checked: existingConfig.features?.suggestions ?? true,
				},
				{
					name: "User Feedback",
					value: "feedback",
					checked: existingConfig.features?.feedback ?? true,
				},
				{
					name: "Export Conversations",
					value: "export",
					checked: existingConfig.features?.export ?? false,
				},
			],
		},
	]);

	// UI customization
	const uiSettings = await inquirer.prompt([
		{
			type: "input",
			name: "primaryColor",
			message: "Primary color (hex code):",
			default: existingConfig.ui?.theme?.primaryColor || "#3B82F6",
			validate: (input: string) => {
				return (
					/^#[0-9A-F]{6}$/i.test(input) || "Please enter a valid hex color code"
				);
			},
		},
		{
			type: "list",
			name: "borderRadius",
			message: "Border radius style:",
			choices: [
				{ name: "None (sharp corners)", value: "none" },
				{ name: "Small", value: "sm" },
				{ name: "Medium", value: "md" },
				{ name: "Large", value: "lg" },
				{ name: "Extra Large", value: "xl" },
			],
			default: existingConfig.ui?.theme?.borderRadius || "md",
		},
		{
			type: "list",
			name: "position",
			message: "Desktop position:",
			choices: [
				{ name: "Bottom Right", value: "bottom-right" },
				{ name: "Bottom Left", value: "bottom-left" },
				{ name: "Top Right", value: "top-right" },
				{ name: "Top Left", value: "top-left" },
			],
			default:
				existingConfig.ui?.positioning?.desktop?.position || "bottom-right",
		},
	]);

	// AI settings
	const aiSettings = await inquirer.prompt([
		{
			type: "list",
			name: "model",
			message: "AI model:",
			choices: [
				{
					name: "Gemini 2.5 Flash Lite (Fast, Free)",
					value: "gemini-2.5-flash-lite",
				},
				{ name: "Gemini 2.5 Flash (Balanced)", value: "gemini-2.5-flash" },
				{ name: "Gemini 2.5 Pro (Advanced)", value: "gemini-2.5-pro" },
				{ name: "Custom", value: "custom" },
			],
			default: existingConfig.api?.model || "gemini-2.5-flash-lite",
		},
		{
			type: "slider",
			name: "temperature",
			message: "Response creativity (temperature):",
			min: 0,
			max: 2,
			step: 0.1,
			default: existingConfig.api?.temperature || 0.7,
		},
		{
			type: "number",
			name: "maxTokens",
			message: "Maximum response length (tokens):",
			default: existingConfig.api?.maxTokens || 2048,
			validate: (input: number) => input > 0 && input <= 8192,
		},
	]);

	// Security settings
	const securitySettings = await inquirer.prompt([
		{
			type: "confirm",
			name: "enableBotDetection",
			message: "Enable bot detection?",
			default: existingConfig.security?.enableBotDetection ?? true,
		},
		{
			type: "confirm",
			name: "enableShield",
			message: "Enable content shield?",
			default: existingConfig.security?.enableShield ?? true,
		},
		{
			type: "confirm",
			name: "contentFiltering",
			message: "Enable content filtering?",
			default: existingConfig.security?.contentFiltering?.enabled ?? true,
		},
		{
			type: "number",
			name: "rateLimitCapacity",
			message: "Rate limit capacity (messages per window):",
			default: existingConfig.rateLimit?.capacity || 5,
			validate: (input: number) => input > 0 && input <= 100,
		},
	]);

	// Build configuration object
	const newConfig: ChatbotConfig = {
		name: basicSettings.name,
		version: "2.0.0",
		framework: "nextjs", // This would be detected from project
		welcomeMessage: basicSettings.welcomeMessage,
		features: {
			conversationHistory: features.enabledFeatures.includes(
				"conversationHistory",
			),
			fileUpload: features.enabledFeatures.includes("fileUpload"),
			voiceInput: features.enabledFeatures.includes("voiceInput"),
			suggestions: features.enabledFeatures.includes("suggestions"),
			feedback: features.enabledFeatures.includes("feedback"),
			export: features.enabledFeatures.includes("export"),
		},
		ui: {
			windowTitle: basicSettings.windowTitle,
			inputPlaceholder: basicSettings.inputPlaceholder,
			avatarFallback: "AI",
			theme: {
				primaryColor: uiSettings.primaryColor,
				borderRadius: uiSettings.borderRadius,
				animation: {
					enabled: true,
					duration: 300,
					easing: "ease-out",
				},
			},
			positioning: {
				mobile: { fullscreen: true },
				desktop: {
					position: uiSettings.position,
					offset: { x: 20, y: 20 },
					size: { width: 400, height: 600 },
				},
			},
		},
		api: {
			model: aiSettings.model,
			systemPrompt: `You are a helpful AI assistant for ${basicSettings.name}. Provide clear, concise, and accurate responses.`,
			temperature: aiSettings.temperature,
			maxTokens: aiSettings.maxTokens,
			timeout: 30000,
		},
		security: {
			enableBotDetection: securitySettings.enableBotDetection,
			enableShield: securitySettings.enableShield,
			contentFiltering: {
				enabled: securitySettings.contentFiltering,
				strictMode: false,
			},
		},
		rateLimit: {
			capacity: securitySettings.rateLimitCapacity,
			refillRate: 2,
			interval: 10,
		},
	};

	await saveConfiguration(configPath, newConfig, options);
}

async function presetConfiguration(
	configPath: string,
	presetName: string,
	existingConfig: Partial<ChatbotConfig>,
	options: ConfigureOptions,
): Promise<void> {
	const preset = PRESETS[presetName as keyof typeof PRESETS];
	if (!preset) {
		console.error(chalk.red(`❌ Unknown preset: ${presetName}`));
		console.log(chalk.gray("Available presets: basic, advanced, enterprise"));
		process.exit(1);
	}

	console.log(chalk.blue(`🎯 Applying ${preset.name} preset`));
	console.log(chalk.gray(`   ${preset.description}\n`));

	// Merge preset with existing config
	const newConfig: ChatbotConfig = {
		name: existingConfig.name || "AI Assistant",
		version: "2.0.0",
		framework: "nextjs",
		welcomeMessage:
			existingConfig.welcomeMessage || "Hello! How can I help you today?",
		...preset.config,
		ui: {
			windowTitle: existingConfig.ui?.windowTitle || "AI Assistant",
			inputPlaceholder:
				existingConfig.ui?.inputPlaceholder || "Type your message...",
			avatarFallback: "AI",
			...preset.config.ui,
			positioning: {
				mobile: { fullscreen: true },
				desktop: {
					position: "bottom-right" as const,
					offset: { x: 20, y: 20 },
					size: { width: 400, height: 600 },
				},
			},
		},
		api: {
			model: existingConfig.api?.model || "gemini-2.5-flash-lite",
			systemPrompt:
				existingConfig.api?.systemPrompt || "You are a helpful AI assistant.",
			temperature: existingConfig.api?.temperature || 0.7,
			maxTokens: existingConfig.api?.maxTokens || 2048,
			timeout: 30000,
		},
		rateLimit: {
			capacity: 5,
			refillRate: 2,
			interval: 10,
		},
	};

	await saveConfiguration(configPath, newConfig, options);
}

async function saveConfiguration(
	configPath: string,
	config: ChatbotConfig,
	options: ConfigureOptions,
): Promise<void> {
	const spinner = ora("Saving configuration...").start();

	try {
		// Ensure directory exists
		await fs.ensureDir(path.dirname(configPath));

		// Generate TypeScript configuration file
		const configContent = generateConfigFile(config);

		const outputPath = options.output || configPath;
		await fs.writeFile(outputPath, configContent);

		spinner.succeed(
			`Configuration saved to ${path.relative(process.cwd(), outputPath)}`,
		);

		// Show summary
		console.log(chalk.green.bold("\n🎉 Configuration updated successfully!\n"));

		console.log(chalk.blue("📋 Configuration Summary:"));
		console.log(`  Name: ${chalk.white(config.name)}`);
		console.log(
			`  Features: ${chalk.white(
				Object.entries(config.features)
					.filter(([, enabled]) => enabled)
					.map(([name]) => name)
					.join(", "),
			)}`,
		);
		console.log(`  AI Model: ${chalk.white(config.api.model)}`);
		console.log(
			`  Security: ${chalk.white(config.security.enableBotDetection ? "Enhanced" : "Basic")}`,
		);

		console.log(chalk.blue("\n📚 Next Steps:"));
		console.log(chalk.gray("  1. Review the generated configuration file"));
		console.log(chalk.gray("  2. Set up your API keys in .env.local"));
		console.log(chalk.gray("  3. Test your chatbot configuration"));
	} catch (error: unknown) {
		spinner.fail("Failed to save configuration");
		console.error(chalk.red("Error:"), (error as ErrorMessage).message);
		process.exit(1);
	}
}

function generateConfigFile(config: ChatbotConfig): string {
	return `/**
 * AI Support Chatbot Configuration
 * Generated by create-next-chatbot
 */

import { z } from 'zod';

export const chatbotConfig = {
  name: "${config.name}",
  version: "${config.version}",
  welcomeMessage: "${config.welcomeMessage}",
  
  ui: {
    windowTitle: "${config.ui.windowTitle}",
    inputPlaceholder: "${config.ui.inputPlaceholder}",
    avatarFallback: "${config.ui.avatarFallback}",
    theme: {
      primaryColor: "${config.ui.theme.primaryColor}",
      borderRadius: "${config.ui.theme.borderRadius}",
      animation: {
        enabled: ${config.ui.theme.animation.enabled},
        duration: ${config.ui.theme.animation.duration},
        easing: "${config.ui.theme.animation.easing}",
      },
    },
    positioning: {
      mobile: {
        fullscreen: ${config.ui.positioning.mobile.fullscreen},
      },
      desktop: {
        position: "${config.ui.positioning.desktop.position}",
        offset: { x: ${config.ui.positioning.desktop.offset.x}, y: ${config.ui.positioning.desktop.offset.y} },
        size: { width: ${config.ui.positioning.desktop.size.width}, height: ${config.ui.positioning.desktop.size.height} },
      },
    },
  },

  features: {
    conversationHistory: ${config.features.conversationHistory},
    fileUpload: ${config.features.fileUpload},
    voiceInput: ${config.features.voiceInput},
    suggestions: ${config.features.suggestions},
    feedback: ${config.features.feedback},
    export: ${config.features.export},
  },

  api: {
    model: "${config.api.model}",
    systemPrompt: \`${config.api.systemPrompt}\`,
    temperature: ${config.api.temperature},
    maxTokens: ${config.api.maxTokens},
    timeout: ${config.api.timeout},
  },

  security: {
    enableBotDetection: ${config.security.enableBotDetection},
    enableShield: ${config.security.enableShield},
    contentFiltering: {
      enabled: ${config.security.contentFiltering.enabled},
      strictMode: ${config.security.contentFiltering.strictMode},
    },
  },

  rateLimit: {
    capacity: ${config.rateLimit.capacity},
    refillRate: ${config.rateLimit.refillRate},
    interval: ${config.rateLimit.interval},
  },
} as const;

export type ChatbotConfig = typeof chatbotConfig;
`;
}

function extractConfigFromFile(content: string): Partial<ChatbotConfig> {
	// Simplified config extraction - in real implementation would use AST parsing
	const config: Partial<ChatbotConfig> = {};

	// Extract basic values using regex (simplified approach)
	const nameMatch = content.match(/name:\s*["']([^"']+)["']/);
	if (nameMatch) config.name = nameMatch[1];

	const welcomeMatch = content.match(/welcomeMessage:\s*["']([^"']+)["']/);
	if (welcomeMatch) config.welcomeMessage = welcomeMatch[1];

	return config;
}
