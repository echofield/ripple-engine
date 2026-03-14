import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RIPPLE Causal Kernel",
  description: "Map causal ripples of urban signals using Intent-Action-Ramification framework",
  keywords: ["causal analysis", "urban signals", "IRA framework", "spatial reasoning"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${mono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
