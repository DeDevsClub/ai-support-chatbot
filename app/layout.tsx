import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Assistant Chatbot",
  description:
    `Template for a simple AI help chatbot.
  Perfect for brand websites and digital applications to provide general info and customer support.`,
  icons: {
    icon: "/favicon.ico",
  },
  keywords: [
    "AI Chatbot",
    "AI Assistant",
    "AI Help",
    "AI Support",
    "AI Chat",
    "AI Chatbot Template",
    "AI Chatbot Example",
    "AI Chatbot Demo",
    "AI Chatbot Tutorial",
    "AI Chatbot Documentation",
  ],
  openGraph: {
    title: "AI Assistant Chatbot",
    description:
      `Template for a simple AI help chatbot.
      Perfect for brand websites and digital applications to provide general info and customer support.`
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
