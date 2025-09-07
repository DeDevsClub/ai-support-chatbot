import { Icon } from "@iconify/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FeaturesGrid from "./features-grid";
import CTA from "./cta";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black text-[#FFFFFF] relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:24px_24px]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute top-0 left-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

      {/* Header */}
      <header className="border-b border-gray-900/50 text-[#FFFFFF] bg-gradient-to-br from-gray-950 to-black backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="text-lg font-semibold">DeDevs AI Support Chatbot</div>

            <Link href="https://github.com/DeDevsClub/create-next-chatbot">
              <Button size="lg" className="w-fit bg-gray-950 text-gray-100 hover:bg-gray-900 border-gray-700 backdrop-blur-sm border-2">
                <Icon icon="mdi:github" className="mr-1" />
                Source Code
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <CTA 
        title="AI Support Chatbot — Template"
        description="Open the chat in the bottom right corner to start a conversation"
        buttons={[
          {
            label: "Source Code",
            link: "https://github.com/DeDevsClub/create-next-chatbot",
            icon: "mdi:github"
          },
          {
            label: "Try Chat",
            link: "https://github.com/DeDevsClub/create-next-chatbot",
            icon: "mdi:chat"
          }
        ]}
        className="py-2"
      />

      {/* Features Section */}
      <FeaturesGrid />

      {/* Footer */}
      <footer className="py-2 bg-gradient-to-br from-gray-950 to-black border-t border-gray-900/50">
        <div className="w-full h-full mx-auto">
          <div className="py-2 text-center text-sm font-bold text-muted-foreground">
            Made with 🩷 and ☕ by{" "}
            <a
              rel="noopener"
              href="https://DeDevs.com/"
              target="_blank"
              className="underline"
            >
              DeDevs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
