import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Webhook Logger - Inspect and Debug Webhook Requests",
  description:
    "A simple tool to receive, log and inspect webhook requests from any service",
  keywords: "webhook, logger, debug, inspect, requests, developer tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className}  antialiased`}>{children}</body>
    </html>
  );
}
