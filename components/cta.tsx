// React and Next.js imports
import Link from "next/link";

// Third-party library imports
import Balancer from "react-wrap-balancer";
import { Icon } from "@iconify/react";

// Custom components
import { Section, Container } from "@/components/ui/base";

interface CTAButton {
    label: string;
    link: string;
    icon?: string;
    variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive";
}

interface CTAProps {
    title: string;
    description: string;
    buttons: CTAButton[];
    className?: string;
}

const CTA = ({ title, description, buttons, className }: CTAProps) => {
    return (
        <Section className={`px-4 ${className || ""}`}>
            <Container className="flex flex-col items-center gap-6 rounded-lg border-2 border-gray-700/50 bg-gradient-to-br from-gray-950 to-black p-6 text-center md:rounded-xl md:p-12">
                <h2 className="!my-0 text-white text-4xl font-bold">{title}</h2>
                <h3 className="!mb-0 text-white text-lg font-medium">
                    <Balancer>
                        {description}
                    </Balancer>
                </h3>
                <div className="not-prose mx-auto flex flex-col md:flex-row items-center gap-4">
                    {buttons.map((button) => (
                        <Link
                            key={`${button.label}-${button.link}`}
                            href={button.link}
                            className="w-fit text-white border-2 border-gray-700/50 bg-gradient-to-br from-gray-950 to-black p-2 rounded-lg backdrop-blur-sm hover:bg-gray-900 hover:border-gray-700"
                        >
                            <div className="flex justify-center items-center gap-2 px-2 rounded-lg">
                                {button.icon && <Icon icon={button.icon} className="mr-1" />}
                                {button.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </Container>
        </Section>
    );
};

export default CTA;
