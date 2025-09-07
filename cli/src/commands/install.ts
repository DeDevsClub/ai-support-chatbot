import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import { ErrorMessage, InstallOptions } from "../types";
import {
	detectProjectInfo,
	getAvailableFrameworks,
	getFramework,
	copyTemplate,
	installDependencies,
	getRelativePath,
} from "../utils";

export async function installCommand(
	options: InstallOptions = {},
): Promise<void> {
	console.log(chalk.cyan.bold("🤖 Installing AI Support Chatbot\n"));

	const currentDir = process.cwd();

	// Detect existing project
	const spinner = ora("Analyzing project structure...").start();
	const projectInfo = await detectProjectInfo(currentDir);

	if (!projectInfo) {
		spinner.fail("No package.json found in current directory");
		console.log(
			chalk.yellow(
				"This command should be run in an existing project directory.",
			),
		);
		console.log(
			chalk.gray('Use "ai-chatbot init" to create a new project instead.'),
		);
		process.exit(1);
	}

	spinner.succeed(
		`Detected ${projectInfo.framework} project: ${projectInfo.name}`,
	);

	// Show project info
	console.log(chalk.blue("\n📋 Project Information:"));
	console.log(`  Name: ${chalk.white(projectInfo.name)}`);
	console.log(`  Framework: ${chalk.white(projectInfo.framework)}`);
	console.log(`  Package Manager: ${chalk.white(projectInfo.packageManager)}`);
	console.log(
		`  TypeScript: ${chalk.white(projectInfo.hasTypeScript ? "Yes" : "No")}`,
	);
	console.log(
		`  Tailwind CSS: ${chalk.white(projectInfo.hasTailwind ? "Yes" : "No")}`,
	);

	// Get framework configuration
	let framework = options.framework || projectInfo.framework;

	if (framework === "unknown" || !getFramework(framework)) {
		const frameworks = getAvailableFrameworks();
		const { selectedFramework } = await inquirer.prompt([
			{
				type: "list",
				name: "selectedFramework",
				message: "Which framework template should we use?",
				choices: frameworks.map((f) => ({
					name: `${f.displayName} - ${f.name}`,
					value: f.name,
				})),
				default: "nextjs",
			},
		]);
		framework = selectedFramework;
	}

	const frameworkConfig = getFramework(framework);
	if (!frameworkConfig) {
		console.error(chalk.red(`❌ Unsupported framework: ${framework}`));
		process.exit(1);
	}

	// Interactive configuration
	if (options.interactive) {
		const { features, aiProvider, customization, installLocation } =
			await inquirer.prompt([
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
						{
							name: "File Upload Support",
							value: "fileUpload",
							checked: false,
						},
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
				{
					type: "list",
					name: "installLocation",
					message: "Where should we install the chatbot components?",
					choices: [
						{
							name: "components/chatbot/ (recommended)",
							value: "components/chatbot",
						},
						{
							name: "src/components/chatbot/",
							value: "src/components/chatbot",
						},
						{ name: "lib/chatbot/", value: "lib/chatbot" },
						{ name: "Custom location", value: "custom" },
					],
					default: "components/chatbot",
				},
			]);

		let targetPath = installLocation;
		if (installLocation === "custom") {
			const { customPath } = await inquirer.prompt([
				{
					type: "input",
					name: "customPath",
					message: "Enter custom installation path:",
					default: "components/chatbot",
				},
			]);
			targetPath = customPath;
		}

		// Show installation plan
		console.log(chalk.blue("\n📋 Installation Plan:"));
		console.log(`  Framework: ${chalk.white(frameworkConfig.displayName)}`);
		console.log(`  AI Provider: ${chalk.white(aiProvider)}`);
		console.log(`  Install Location: ${chalk.white(targetPath)}`);
		console.log(`  Features: ${chalk.white(features.join(", ") || "Basic")}`);
		if (customization) {
			console.log(`  Brand Color: ${chalk.white(customization)}`);
		}

		if (options.dryRun) {
			console.log(chalk.yellow("\n🔍 Dry Run - No changes will be made\n"));
			await showInstallationPreview(currentDir, targetPath, frameworkConfig);
			return;
		}

		const { confirm } = await inquirer.prompt([
			{
				type: "confirm",
				name: "confirm",
				message: "Proceed with installation?",
				default: true,
			},
		]);

		if (!confirm) {
			console.log(chalk.yellow("Installation cancelled."));
			process.exit(0);
		}

		// Perform installation
		await performInstallation(currentDir, targetPath, frameworkConfig, {
			features,
			aiProvider,
			customization,
			projectInfo,
		});
	} else {
		// Non-interactive installation
		const targetPath = "components/chatbot";

		if (options.dryRun) {
			console.log(chalk.yellow("\n🔍 Dry Run - No changes will be made\n"));
			await showInstallationPreview(currentDir, targetPath, frameworkConfig);
			return;
		}

		await performInstallation(currentDir, targetPath, frameworkConfig, {
			features: ["conversationHistory", "suggestions", "feedback"],
			aiProvider: "google",
			customization: "#3B82F6",
			projectInfo,
		});
	}
}

async function showInstallationPreview(
	projectDir: string,
	targetPath: string,
	frameworkConfig: any,
): Promise<void> {
	console.log(chalk.blue("Files that would be created/modified:"));

	const fullTargetPath = path.join(projectDir, targetPath);
	console.log(
		chalk.green(`  + ${getRelativePath(projectDir, fullTargetPath)}/`),
	);
	console.log(chalk.green(`    + index.tsx`));
	console.log(chalk.green(`    + conversation.tsx`));
	console.log(chalk.green(`    + message.tsx`));
	console.log(chalk.green(`    + types.ts`));

	console.log(chalk.green(`  + lib/chatbot-config.ts`));
	console.log(chalk.green(`  + app/api/chat/route.ts`));

	console.log(chalk.yellow(`  ~ package.json (dependencies)`));
	console.log(chalk.yellow(`  ~ .env.local (API keys)`));

	if (!(await fs.pathExists(path.join(projectDir, "tailwind.config.js")))) {
		console.log(chalk.green(`  + tailwind.config.js`));
	}
}

async function performInstallation(
	projectDir: string,
	targetPath: string,
	frameworkConfig: any,
	config: {
		features: string[];
		aiProvider: string;
		customization: string;
		projectInfo: any;
	},
): Promise<void> {
	const installSpinner = ora("Installing chatbot components...").start();

	try {
		// Create target directory
		const fullTargetPath = path.join(projectDir, targetPath);
		await fs.ensureDir(fullTargetPath);

		// Copy template files
		const templatePath = path.join(
			__dirname,
			"../../templates",
			frameworkConfig.templatePath,
		);
		const templateVariables = {
			PROJECT_NAME: config.projectInfo.name,
			FRAMEWORK: frameworkConfig.name,
			AI_PROVIDER: config.aiProvider,
			PRIMARY_COLOR: config.customization,
			FEATURES: JSON.stringify(config.features),
			PACKAGE_MANAGER: config.projectInfo.packageManager,
		};

		await copyTemplate(templatePath, projectDir, templateVariables);

		// Update package.json with new dependencies
		const packageJsonPath = path.join(projectDir, "package.json");
		const packageJson = await fs.readJson(packageJsonPath);

		// Add missing dependencies
		const missingDeps = frameworkConfig.dependencies.filter(
			(dep: string) =>
				!packageJson.dependencies[dep] && !packageJson.devDependencies[dep],
		);

		const missingDevDeps = frameworkConfig.devDependencies.filter(
			(dep: string) =>
				!packageJson.dependencies[dep] && !packageJson.devDependencies[dep],
		);

		if (missingDeps.length > 0) {
			missingDeps.forEach((dep: string) => {
				packageJson.dependencies[dep] = "latest";
			});
		}

		if (missingDevDeps.length > 0) {
			missingDevDeps.forEach((dep: string) => {
				packageJson.devDependencies[dep] = "latest";
			});
		}

		await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

		// Update or create environment file
		const envPath = path.join(projectDir, ".env.local");
		let envContent = "";

		if (await fs.pathExists(envPath)) {
			envContent = await fs.readFile(envPath, "utf-8");
		}

		// Add missing environment variables
		const requiredEnvVars = [
			"GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here",
			"ARCJET_KEY=your_arcjet_key_here",
			`CHATBOT_NAME="${config.projectInfo.name}"`,
			'CHATBOT_WELCOME_MESSAGE="Hello! I\'m your AI assistant. How can I help you today?"',
			`CHATBOT_PRIMARY_COLOR="${config.customization}"`,
		];

		for (const envVar of requiredEnvVars) {
			const [key] = envVar.split("=");
			if (!envContent.includes(key)) {
				envContent += `\n${envVar}`;
			}
		}

		await fs.writeFile(envPath, envContent.trim() + "\n");

		installSpinner.succeed("Chatbot components installed");

		// Install new dependencies
		if (missingDeps.length > 0 || missingDevDeps.length > 0) {
			const depSpinner = ora(
				`Installing new dependencies with ${config.projectInfo.packageManager}...`,
			).start();
			try {
				await installDependencies(
					projectDir,
					config.projectInfo.packageManager,
				);
				depSpinner.succeed("Dependencies installed");
			} catch (error: unknown) {
				depSpinner.fail("Dependency installation failed");
				console.log((error as ErrorMessage).message);
				console.log(
					chalk.yellow(`\nYou can install dependencies manually by running:`),
				);
				console.log(
					chalk.gray(`  ${config.projectInfo.packageManager} install`),
				);
				// process.exit(1);
			}
		}

		// Success message
		console.log(
			chalk.green.bold("\n🎉 AI Support Chatbot installed successfully!\n"),
		);

		console.log(chalk.blue("Next steps:"));
		console.log(chalk.gray("  1. Configure your API keys in .env.local"));
		console.log(chalk.gray(`  2. Import the chatbot component in your app`));
		console.log(
			chalk.gray(`  3. ${config.projectInfo.packageManager} run dev`),
		);

		console.log(chalk.blue("\n📚 Usage Example:"));
		console.log(chalk.gray(`  import { Chatbot } from './${targetPath}';`));
		console.log(chalk.gray("  "));
		console.log(chalk.gray("  export default function App() {"));
		console.log(chalk.gray("    return ("));
		console.log(chalk.gray("      <div>"));
		console.log(chalk.gray("        {/* Your app content */}"));
		console.log(chalk.gray("        <Chatbot />"));
		console.log(chalk.gray("      </div>"));
		console.log(chalk.gray("    );"));
		console.log(chalk.gray("  }"));

		console.log(chalk.blue("\n🔑 Required API Keys:"));
		console.log(
			chalk.gray("  • Google AI: https://makersuite.google.com/app/apikey"),
		);
		console.log(chalk.gray("  • Arcjet (security): https://app.arcjet.com/"));
	} catch (error) {
		installSpinner.fail("Installation failed");
		console.error(chalk.red("Error:"), (error as ErrorMessage).message);
		process.exit(1);
	}
}
