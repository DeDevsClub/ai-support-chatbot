import type { JSX } from "react";
import { Icon } from "@iconify/react";

interface Feature {
    title: string;
    description: string;
    icon: JSX.Element;
    status: string;
    tags: string[];
    colSpan?: number;
    hasPersistentHover?: boolean;
}

const chatbotFeatures: Feature[] = [
    {
        title: "AI-Powered Conversations",
        description: "Advanced natural language processing with Google Gemini AI for intelligent, context-aware responses",
        icon: <Icon icon="mdi:robot" className="w-4 h-4 text-blue-500" />,
        status: "Core Feature",
        tags: ["AI", "Gemini", "NLP"],
        colSpan: 2,
        hasPersistentHover: true,
    },
    {
        title: "Arcjet Protection",
        description: "Built-in rate limiting and bot protection to keep your chatbot secure and performant",
        icon: <Icon icon="mdi:shield-check" className="w-4 h-4 text-emerald-500" />,
        status: "Security",
        tags: ["Protection", "Rate Limiting"],
    },
    {
        title: "Free Tier Ready",
        description: "Optimized for Google Gemini's generous free tier - no API costs to get started",
        icon: <Icon icon="mdi:currency-usd-off" className="w-4 h-4 text-green-500" />,
        status: "Cost Effective",
        tags: ["Free", "Budget"],
    },
    {
        title: "Customizable UI",
        description: "Beautiful, responsive design with Tailwind CSS and shadcn/ui components. Fully customizable themes and layouts",
        icon: <Icon icon="mdi:palette" className="w-4 h-4 text-purple-500" />,
        status: "Design",
        tags: ["UI/UX", "Tailwind", "Responsive"],
        colSpan: 2,
    },
    {
        title: "Interactive Buttons",
        description: "Support for choice buttons and link buttons in responses for enhanced user interaction",
        icon: <Icon icon="mdi:gesture-tap-button" className="w-4 h-4 text-orange-500" />,
        status: "Interactive",
        tags: ["UX", "Buttons"],
    },
    {
        title: "Environment Config",
        description: "Comprehensive configuration system with 50+ environment variables for complete customization",
        icon: <Icon icon="mdi:cog" className="w-4 h-4 text-gray-500" />,
        status: "Configurable",
        tags: ["Config", "Environment"],
    },
    {
        title: "TypeScript Ready",
        description: "Full TypeScript support with type safety, validation, and excellent developer experience",
        icon: <Icon icon="mdi:language-typescript" className="w-4 h-4 text-blue-600" />,
        status: "Developer",
        tags: ["TypeScript", "DX"],
    },
];

export default chatbotFeatures;
