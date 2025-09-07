import path from "node:path";
import fs from "fs-extra";
import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import type { InitOptions, PackageJson } from "../types";
import {
	validateProjectName,
	getAvailableFrameworks,
	getFramework,
	copyTemplate,
	installDependencies,
	isDirectoryEmpty,
} from "../utils";

export async function initCommand(
	name?: string,
	options: InitOptions = {},
): Promise<void> {
	console.log(chalk.cyan.bold("🤖 Initializing AI Support Chatbot Project\n"));

	// Get project name
	let projectName = name;
	if (!projectName) {
		const { inputName } = await inquirer.prompt([
			{
				type: "input",
				name: "inputName",
				message: "What is your project name?",
				default: "ai-support-chatbot",
				validate: (input: string) => {
					const validation = validateProjectName(input);
					return validation.valid || validation.errors.join(", ");
				},
			},
		]);
		projectName = inputName;
	}

	// Validate project name
	const nameValidation = validateProjectName(projectName!);
	if (!nameValidation.valid) {
		console.error(chalk.red("❌ Invalid project name:"));
		nameValidation.errors.forEach((error) =>
			console.error(chalk.red(`  • ${error}`)),
		);
		process.exit(1);
	}

	// Get target directory
	const targetDir =
		options.directory || path.resolve(process.cwd(), projectName!);

	// Check if directory exists and is not empty
	if (await fs.pathExists(targetDir)) {
		const isEmpty = await isDirectoryEmpty(targetDir);
		if (!isEmpty) {
			const { overwrite } = await inquirer.prompt([
				{
					type: "confirm",
					name: "overwrite",
					message: `Directory ${targetDir} is not empty. Continue anyway?`,
					default: false,
				},
			]);

			if (!overwrite) {
				console.log(chalk.yellow("Operation cancelled."));
				process.exit(0);
			}
		}
	}

	// Get framework
	let framework = options.framework;
	if (!framework) {
		const frameworks = getAvailableFrameworks();
		const { selectedFramework } = await inquirer.prompt([
			{
				type: "list",
				name: "selectedFramework",
				message: "Which framework would you like to use?",
				choices: frameworks.map((f) => ({
					name: `${f.displayName} - ${f.name}`,
					value: f.name,
				})),
				default: "nextjs",
			},
		]);
		framework = selectedFramework;
	}

	const frameworkConfig = getFramework(framework!);
	if (!frameworkConfig) {
		console.error(chalk.red(`❌ Unknown framework: ${framework}`));
		process.exit(1);
	}

	// Get additional options
	const { features, aiProvider, customization } = await inquirer.prompt([
		{
			type: "checkbox",
			name: "features",
			message: "Which features would you like to enable?",
			choices: [
				{
					name: "Conversation History",
					value: "conversationHistory",
					checked: true,
				},
				{ name: "File Upload Support", value: "fileUpload", checked: false },
				{ name: "Voice Input", value: "voiceInput", checked: false },
				{ name: "Smart Suggestions", value: "suggestions", checked: true },
				{ name: "User Feedback", value: "feedback", checked: true },
				{ name: "Export Conversations", value: "export", checked: false },
			],
		},
		{
			type: "list",
			name: "aiProvider",
			message: "Which AI provider would you like to use?",
			choices: [
				{ name: "Google Gemini (Free tier available)", value: "google" },
				{ name: "OpenAI GPT", value: "openai" },
				{ name: "Anthropic Claude", value: "anthropic" },
				{ name: "Custom/Other", value: "custom" },
			],
			default: "google",
		},
		{
			type: "input",
			name: "customization",
			message: "Primary brand color (hex code, optional):",
			validate: (input: string) => {
				if (!input) return true;
				return (
					/^#[0-9A-F]{6}$/i.test(input) ||
					"Please enter a valid hex color code (e.g., #3B82F6)"
				);
			},
		},
	]);

	console.log(chalk.blue("\n📋 Project Configuration:"));
	console.log(`  Name: ${chalk.white(projectName)}`);
	console.log(`  Framework: ${chalk.white(frameworkConfig.displayName)}`);
	console.log(`  Directory: ${chalk.white(targetDir)}`);
	console.log(`  AI Provider: ${chalk.white(aiProvider)}`);
	console.log(`  Features: ${chalk.white(features.join(", ") || "None")}`);
	if (customization) {
		console.log(`  Brand Color: ${chalk.white(customization)}`);
	}

	const { confirm } = await inquirer.prompt([
		{
			type: "confirm",
			name: "confirm",
			message: "Create project with these settings?",
			default: true,
		},
	]);

	if (!confirm) {
		console.log(chalk.yellow("Operation cancelled."));
		process.exit(0);
	}

	// Create project
	const spinner = ora("Creating project structure...").start();

	try {
		// Ensure target directory exists
		await fs.ensureDir(targetDir);

		// Copy template files
		const templatePath = path.join(
			__dirname,
			"../../templates",
			frameworkConfig.templatePath,
		);
		const templateVariables = {
			PROJECT_NAME: projectName || "AI Support Chatbot",
			FRAMEWORK: framework!,
			AI_PROVIDER: aiProvider,
			PRIMARY_COLOR: customization || "#3B82F6",
			FEATURES: JSON.stringify(features),
			PACKAGE_MANAGER: frameworkConfig.packageManager,
		};

		await copyTemplate(templatePath, targetDir, templateVariables);

		// Create package.json
		const packageJson: PackageJson = {
			name: projectName || "ai-chatbot",
			version: "0.1.0",
			private: true,
			scripts: frameworkConfig.scripts,
			dependencies: {},
			devDependencies: {},
		};

		// Add dependencies based on framework
		frameworkConfig.dependencies.forEach((dep) => {
			packageJson.dependencies[dep] = "latest";
		});

		frameworkConfig.devDependencies.forEach((dep) => {
			packageJson.devDependencies[dep] = "latest";
		});

		await fs.writeJson(path.join(targetDir, "package.json"), packageJson, {
			spaces: 2,
		});

		// Create environment file
		const envContent = `# AI Provider Configuration
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here

# Chatbot Configuration
CHATBOT_NAME="${projectName}"
CHATBOT_WELCOME_MESSAGE="Hello! I'm your AI assistant. How can I help you today?"
CHATBOT_PRIMARY_COLOR="${customization || "#3B82F6"}"

# Security (Arcjet)
ARCJET_KEY=your_arcjet_key_here

# Optional: Analytics
# CHATBOT_ANALYTICS_ENABLED=true
# CHATBOT_ANALYTICS_PROVIDER=google
# CHATBOT_ANALYTICS_TRACKING_ID=your_tracking_id
`;

		await fs.writeFile(path.join(targetDir, ".env.local"), envContent);
		await fs.writeFile(path.join(targetDir, ".env.example"), envContent);

		spinner.succeed("Project structure created");

		// Initialize git repository
		if (options.git !== false) {
			const gitSpinner = ora("Initializing git repository...").start();
			try {
				const { spawn } = await import("child_process");
				await new Promise<void>((resolve, reject) => {
					const git = spawn("git", ["init"], { cwd: targetDir, stdio: "pipe" });
					git.on("close", (code) => {
						if (code === 0) resolve();
						else reject(new Error(`git init failed with code ${code}`));
					});
					git.on("error", reject);
				});
				gitSpinner.succeed("Git repository initialized");
			} catch (error: unknown) {
				gitSpinner.warn(
					"Git initialization failed (git not found or error occurred)",
				);
			}
		}

		// Install dependencies
		if (options.install !== false) {
			const installSpinner = ora(
				`Installing dependencies with ${frameworkConfig.packageManager}...`,
			).start();
			try {
				await installDependencies(targetDir, frameworkConfig.packageManager);
				installSpinner.succeed("Dependencies installed");
			} catch (error: unknown) {
				installSpinner.fail("Dependency installation failed");
				console.error(chalk.red("Error:"), (error as Error).message);
				console.log(
					chalk.yellow(`\nYou can install dependencies manually by running:`),
				);
				console.log(chalk.gray(`  cd ${projectName}`));
				console.log(chalk.gray(`  ${frameworkConfig.packageManager} install`));
			}
		}

		// Success message
		console.log(chalk.green.bold("\n🎉 Project created successfully!\n"));

		console.log(chalk.blue("Next steps:"));
		console.log(chalk.gray(`  1. cd ${projectName}`));

		if (options.install === false) {
			console.log(chalk.gray(`  2. ${frameworkConfig.packageManager} install`));
			console.log(chalk.gray("  3. Configure your API keys in .env.local"));
			console.log(chalk.gray(`  4. ${frameworkConfig.packageManager} run dev`));
		} else {
			console.log(chalk.gray("  2. Configure your API keys in .env.local"));
			console.log(chalk.gray(`  3. ${frameworkConfig.packageManager} run dev`));
		}

		console.log(chalk.blue("\n📚 Documentation:"));
		console.log(
			chalk.gray("  https://github.com/DeDevsClub/ai-support-chatbot#readme"),
		);

		console.log(chalk.blue("\n🔑 Required API Keys:"));
		console.log(
			chalk.gray("  • Google AI: https://makersuite.google.com/app/apikey"),
		);
		console.log(chalk.gray("  • Arcjet (security): https://app.arcjet.com/"));
	} catch (error: unknown) {
		spinner.fail("Project creation failed");
		console.error(chalk.red("Error:"), (error as Error).message);
		process.exit(1);
	}
}
