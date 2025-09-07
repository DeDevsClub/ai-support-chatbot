
import chatbotFeatures from "@/lib/features";
import BentoGrid from "./bento-grid";

export default function FeaturesGrid() {
    return (
        <section className="relative py-24 bg-gradient-to-br from-gray-950 to-black overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:24px_24px]" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-700/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gray-700/10 rounded-full blur-3xl" />
            
            <div className="relative container mx-auto px-4">
                <div className="text-center mb-16 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-700/10 backdrop-blur-sm border border-gray-700/20">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-white/90">Features and Capabilities</span>
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white leading-tight">
                        Powerful AI Chatbot — Built for Developers
                    </h2>
                    
                    <p className="text-md md:text-lg text-white/80 max-w-screen-lg w-full mx-auto leading-relaxed border-2 border-gray-700/50 bg-gradient-to-br from-gray-950 to-black p-2 rounded-lg backdrop-blur-sm">
                        Explore the comprehensive features that make this AI chatbot template 
                        the perfect foundation for your next project
                    </p>
                </div>
                
                <div className="relative">
                    <BentoGrid items={chatbotFeatures} />
                </div>
            </div>
        </section>
    );
}