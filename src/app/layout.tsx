import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NextFlow — AI Workflow Builder",
  description: "Build and execute LLM workflows visually",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en" className={`${inter.variable} h-full dark`}>
        <body className="min-h-full bg-[#0a0a0f] text-white font-sans antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
