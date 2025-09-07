export type ErrorMessage = {
  error: Error;
  message: string;
  status: number;
  statusCode: number;
  response: Response;
};

export interface Framework {
  name: string;
  displayName: string;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  dependencies: string[];
  devDependencies: string[];
  scripts: Record<string, string>;
  configFiles: string[];
  templatePath: string;
}

export interface Template {
  name: string;
  displayName: string;
  description: string;
  framework: string;
  features: string[];
  files: TemplateFile[];
}

export interface TemplateFile {
  path: string;
  content: string;
  type: 'file' | 'directory';
  overwrite?: boolean;
}

export interface ChatbotConfig {
  name: string;
  version: string;
  framework: string;
  welcomeMessage: string;
  features: {
    conversationHistory: boolean;
    fileUpload: boolean;
    voiceInput: boolean;
    suggestions: boolean;
    feedback: boolean;
    export: boolean;
  };
  ui: {
    windowTitle: string;
    inputPlaceholder: string;
    avatarImage?: string;
    avatarFallback: string;
    theme: {
      primaryColor?: string;
      borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
      animation: {
        enabled: boolean;
        duration: number;
        easing: string;
      };
    };
    positioning: {
      mobile: {
        fullscreen: boolean;
      };
      desktop: {
        position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
        offset: { x: number; y: number };
        size: { width: number; height: number };
      };
    };
  };
  api: {
    model: string;
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
    timeout: number;
  };
  security: {
    enableBotDetection: boolean;
    enableShield: boolean;
    contentFiltering: {
      enabled: boolean;
      strictMode: boolean;
    };
  };
  rateLimit: {
    capacity: number;
    refillRate: number;
    interval: number;
  };
}

export interface InstallOptions {
  framework?: string;
  config?: string;
  interactive?: boolean;
  dryRun?: boolean;
}

export interface InitOptions {
  framework?: string;
  template?: string;
  directory?: string;
  install?: boolean;
  git?: boolean;
}

export interface ConfigureOptions {
  config?: string;
  interactive?: boolean;
  preset?: string;
  output?: string;
}

export interface ProjectInfo {
  name: string;
  version: string;
  framework: string;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  hasTypeScript: boolean;
  hasTailwind: boolean;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export interface PackageJson {
  name: string;
  version: string;
  private: boolean;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}
