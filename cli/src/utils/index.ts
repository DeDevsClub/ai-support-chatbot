import path from "node:path";
import fs from "fs-extra";
import chalk from "chalk";
import { glob } from "glob";

import validatePackageName from "validate-npm-package-name";
import type { ProjectInfo, Framework } from "../types";

/**
 * Detect project information from package.json and other files
 */
export async function detectProjectInfo(
	projectPath: string,
): Promise<ProjectInfo | null> {
	const packageJsonPath = path.join(projectPath, "package.json");

	if (!(await fs.pathExists(packageJsonPath))) {
		return null;
	}

	try {
		const packageJson = await fs.readJson(packageJsonPath);
		const dependencies = {
			...packageJson.dependencies,
			...packageJson.devDependencies,
		};

		// Detect framework
		let framework = "unknown";
		if (dependencies.next) framework = "nextjs";
		else if (dependencies.react && !dependencies.next) framework = "react";
		else if (dependencies.vue) framework = "vue";
		else if (dependencies["@angular/core"]) framework = "angular";
		else if (dependencies.express) framework = "express";
		else if (dependencies.nuxt) framework = "nuxt";
		else if (dependencies.svelte) framework = "svelte";

		// Detect package manager
		let packageManager: "npm" | "yarn" | "pnpm" = "npm";
		if (await fs.pathExists(path.join(projectPath, "pnpm-lock.yaml"))) {
			packageManager = "pnpm";
		} else if (await fs.pathExists(path.join(projectPath, "yarn.lock"))) {
			packageManager = "yarn";
		}

		// Check for TypeScript
		const hasTypeScript = !!(
			dependencies.typescript ||
			(await fs.pathExists(path.join(projectPath, "tsconfig.json")))
		);

		// Check for Tailwind CSS
		const hasTailwind = !!(
			dependencies.tailwindcss ||
			(await fs.pathExists(path.join(projectPath, "tailwind.config.js"))) ||
			(await fs.pathExists(path.join(projectPath, "tailwind.config.ts")))
		);

		return {
			name: packageJson.name || path.basename(projectPath),
			version: packageJson.version || "1.0.0",
			framework,
			packageManager,
			hasTypeScript,
			hasTailwind,
			dependencies: packageJson.dependencies || {},
			devDependencies: packageJson.devDependencies || {},
		};
	} catch (error) {
		console.error(chalk.red("Error reading package.json:"), error);
		return null;
	}
}

/**
 * Validate project name
 */
export function validateProjectName(name: string): {
	valid: boolean;
	errors: string[];
} {
	const result = validatePackageName(name);
	return {
		valid: result.validForNewPackages,
		errors: [...(result.errors || []), ...(result.warnings || [])],
	};
}

/**
 * Get available frameworks
 */
export function getAvailableFrameworks(): Framework[] {
	return [
		{
			name: "nextjs",
			displayName: "Next.js",
			packageManager: "npm",
			dependencies: [
				"next",
				"react",
				"react-dom",
				"@ai-sdk/google",
				"@ai-sdk/react",
				"ai",
				"zod",
				"clsx",
				"tailwind-merge",
				"class-variance-authority",
				"lucide-react",
				"@radix-ui/react-avatar",
				"@radix-ui/react-slot",
				"react-markdown",
				"use-stick-to-bottom",
				"@arcjet/next",
			],
			devDependencies: [
				"@types/node",
				"@types/react",
				"@types/react-dom",
				"typescript",
				"tailwindcss",
				"postcss",
				"autoprefixer",
				"eslint",
				"eslint-config-next",
			],
			scripts: {
				dev: "next dev",
				build: "next build",
				start: "next start",
				lint: "next lint",
			},
			configFiles: [
				"next.config.js",
				"tailwind.config.js",
				"postcss.config.js",
			],
			templatePath: "nextjs",
		},
		{
			name: "react",
			displayName: "React (Vite)",
			packageManager: "npm",
			dependencies: [
				"react",
				"react-dom",
				"@ai-sdk/google",
				"@ai-sdk/react",
				"ai",
				"zod",
				"clsx",
				"tailwind-merge",
				"class-variance-authority",
				"lucide-react",
				"@radix-ui/react-avatar",
				"@radix-ui/react-slot",
				"react-markdown",
				"use-stick-to-bottom",
			],
			devDependencies: [
				"@types/react",
				"@types/react-dom",
				"@vitejs/plugin-react",
				"vite",
				"typescript",
				"tailwindcss",
				"postcss",
				"autoprefixer",
				"eslint",
				"@typescript-eslint/eslint-plugin",
				"@typescript-eslint/parser",
			],
			scripts: {
				dev: "vite",
				build: "tsc && vite build",
				preview: "vite preview",
				lint: "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
			},
			configFiles: [
				"vite.config.ts",
				"tailwind.config.js",
				"postcss.config.js",
			],
			templatePath: "react",
		},
		{
			name: "vue",
			displayName: "Vue.js",
			packageManager: "npm",
			dependencies: [
				"vue",
				"@ai-sdk/google",
				"ai",
				"zod",
				"clsx",
				"tailwind-merge",
				"class-variance-authority",
				"lucide-vue-next",
				"@radix-vue/avatar",
				"markdown-it",
			],
			devDependencies: [
				"@vitejs/plugin-vue",
				"vite",
				"typescript",
				"vue-tsc",
				"tailwindcss",
				"postcss",
				"autoprefixer",
				"eslint",
				"@typescript-eslint/eslint-plugin",
				"@typescript-eslint/parser",
			],
			scripts: {
				dev: "vite",
				build: "vue-tsc && vite build",
				preview: "vite preview",
				lint: "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore",
			},
			configFiles: [
				"vite.config.ts",
				"tailwind.config.js",
				"postcss.config.js",
			],
			templatePath: "vue",
		},
		{
			name: "angular",
			displayName: "Angular",
			packageManager: "npm",
			dependencies: [
				"@angular/core",
				"@angular/common",
				"@angular/platform-browser",
				"@angular/platform-browser-dynamic",
				"@angular/router",
				"@ai-sdk/google",
				"ai",
				"zod",
				"clsx",
				"tailwind-merge",
				"class-variance-authority",
				"lucide-angular",
				"marked",
				"rxjs",
				"tslib",
				"zone.js",
			],
			devDependencies: [
				"@angular/cli",
				"@angular/compiler-cli",
				"@types/node",
				"typescript",
				"tailwindcss",
				"postcss",
				"autoprefixer",
				"eslint",
				"@typescript-eslint/eslint-plugin",
				"@typescript-eslint/parser",
			],
			scripts: {
				ng: "ng",
				start: "ng serve",
				build: "ng build",
				test: "ng test",
				lint: "ng lint",
			},
			configFiles: ["angular.json", "tailwind.config.js", "postcss.config.js"],
			templatePath: "angular",
		},
		{
			name: "express",
			displayName: "Express.js",
			packageManager: "npm",
			dependencies: [
				"express",
				"cors",
				"@ai-sdk/google",
				"ai",
				"zod",
				"helmet",
				"compression",
				"morgan",
			],
			devDependencies: [
				"@types/node",
				"@types/express",
				"@types/cors",
				"typescript",
				"ts-node",
				"nodemon",
				"eslint",
				"@typescript-eslint/eslint-plugin",
				"@typescript-eslint/parser",
			],
			scripts: {
				dev: "nodemon --exec ts-node src/index.ts",
				build: "tsc",
				start: "node dist/index.js",
				lint: "eslint src/**/*.ts",
			},
			configFiles: ["tsconfig.json"],
			templatePath: "express",
		},
	];
}

/**
 * Get framework by name
 */
export function getFramework(name: string): Framework | undefined {
	return getAvailableFrameworks().find((f) => f.name === name);
}

/**
 * Copy template files with variable replacement
 */
export async function copyTemplate(
	templatePath: string,
	targetPath: string,
	variables: Record<string, string> = {},
): Promise<void> {
	const files = await glob("**/*", {
		cwd: templatePath,
		dot: true,
		nodir: true,
	});

	for (const file of files) {
		const sourcePath = path.join(templatePath, file);
		const targetFilePath = path.join(targetPath, file);

		// Ensure target directory exists
		await fs.ensureDir(path.dirname(targetFilePath));

		// Read file content
		let content = await fs.readFile(sourcePath, "utf-8");

		// Replace variables in content
		for (const [key, value] of Object.entries(variables)) {
			const regex = new RegExp(`{{${key}}}`, "g");
			content = content.replace(regex, value);
		}

		// Write file
		await fs.writeFile(targetFilePath, content);
	}
}

/**
 * Install dependencies using the appropriate package manager
 */
export async function installDependencies(
	projectPath: string,
	packageManager: "npm" | "yarn" | "pnpm" = "npm",
): Promise<void> {
	const { spawn } = await import("child_process");

	return new Promise((resolve, reject) => {
		const command = packageManager === "yarn" ? "yarn" : packageManager;
		const args = packageManager === "yarn" ? ["install"] : ["install"];

		const child = spawn(command, args, {
			cwd: projectPath,
			stdio: "inherit",
		});

		child.on("close", (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`${packageManager} install failed with code ${code}`));
			}
		});

		child.on("error", reject);
	});
}

/**
 * Check if directory is empty
 */
export async function isDirectoryEmpty(dirPath: string): Promise<boolean> {
	try {
		const files = await fs.readdir(dirPath);
		return files.length === 0;
	} catch {
		return true; // Directory doesn't exist, so it's "empty"
	}
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
	const sizes = ["B", "KB", "MB", "GB"];
	if (bytes === 0) return "0 B";
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Get relative path for display
 */
export function getRelativePath(from: string, to: string): string {
	const relativePath = path.relative(from, to);
	return relativePath.startsWith("..") ? to : `./${relativePath}`;
}
