import type React from "react"
import { cn } from "@/lib/utils"
// Icons are passed as props in the BentoItem interface
import Link from "next/link"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"

interface BentoItem {
    title: string
    description: string
    icon: React.ReactNode
    status?: string
    tags?: string[]
    meta?: string
    cta?: string
    colSpan?: number
    hasPersistentHover?: boolean
}

interface BentoGridProps {
    items: BentoItem[]
}

// const itemsSample: BentoItem[] = [
//   {
//     title: "Luxury Beachfront Villa",
//     meta: "4.9 (128 reviews)",
//     description:
//       "Stunning oceanfront property with private pool, modern amenities, and breathtaking sunset views. Perfect for family getaways.",
//     icon: <Home className="w-4 h-4 text-blue-500" />,
//     status: "Superhost",
//     tags: ["Beachfront", "Pool", "Luxury"],
//     colSpan: 2,
//     hasPersistentHover: true,
//   }
// ]

export default function BentoGrid({ items }: BentoGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 max-w-screen-2xl mx-auto h-full w-full">
            {items.map((item) => (
                <Link
                    href="https://github.com/DeDevsClub/ai-support-chatbot"
                    key={`${item.title}-${item.status || item.meta}`}
                    className={cn(item.colSpan || "col-span-1", item.colSpan === 2 ? "md:col-span-2" : "")}
                >
                    <Card
                        className={cn(
                            "group relative h-full transition-all duration-300",
                            "hover:shadow-xl hover:shadow-gray-700/20",
                            "hover:-translate-y-1 will-change-transform",
                            "overflow-hidden border-0",
                            "bg-gradient-to-br from-gray-950 to-black backdrop-blur-sm",
                            "ring-1 ring-gray-700/50",
                            {
                                "shadow-lg shadow-gray-700/20 -translate-y-1": item.hasPersistentHover,
                            },
                        )}
                    >
                        {/* Animated background pattern */}
                        <div
                            className={cn(
                                "absolute inset-0",
                                item.hasPersistentHover ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                                "transition-opacity duration-500",
                            )}
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[length:6px_6px] animate-pulse" />
                        </div>

                        {/* Gradient border effect */}
                        <div
                            className={cn(
                                "absolute inset-0 rounded-xl",
                                "bg-gradient-to-br from-gray-950/5 via-transparent to-black/10",
                                item.hasPersistentHover ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                                "transition-opacity duration-500",
                            )}
                        />

                        <CardHeader className="relative space-y-0 p-6">
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-950 ring-1 ring-gray-900/50">
                                    {item.icon}
                                </div>  
                                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-gray-950 to-gray-950 text-gray-100 ring-1 ring-gray-900/50">
                                    {item.status || "Active"}
                                </span>
                            </div>
                        </CardHeader>

                        <CardContent className="relative space-y-3 p-6 pt-0">
                            <h3 className="font-semibold text-gray-100 tracking-tight text-base leading-tight">
                                {item.title}
                                {item.meta && (
                                    <span className="ml-2 text-xs text-gray-500 font-normal">
                                        {item.meta}
                                    </span>
                                )}
                            </h3>
                            <p className="text-sm text-gray-100 leading-relaxed font-normal">
                                {item.description}
                            </p>
                        </CardContent>

                        <CardFooter className="relative p-6 pt-0">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2 text-xs">
                                    {item.tags?.map((tag) => (
                                        <span
                                            key={`${item.title}-${tag}`}
                                            className="px-2.5 py-1 rounded-full bg-gray-900 text-gray-100 font-medium transition-all duration-200 hover:bg-gray-700"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                                <span className="text-xs text-gray-100 font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                    {item.cta || "Explore →"}
                                </span>
                            </div>
                        </CardFooter>

                        {/* Subtle inner glow */}
                        <div
                            className={cn(
                                "absolute inset-0 rounded-xl",
                                "bg-gradient-to-br from-gray-900/30 via-transparent to-transparent",
                                "pointer-events-none",
                            )}
                        />
                    </Card>
                </Link>
            ))}
        </div>
    )
}
