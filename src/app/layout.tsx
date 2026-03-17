import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YT x Downloader | Fast & Free YouTube Converter",
  description: "Professional YouTube video and audio downloader by @HandityaGilang. High quality, no registration required.",
  icons: {
    icon: [
      { url: "/Logo.png", sizes: "32x32" },
      { url: "/Logo.png", sizes: "16x16" },
    ],
    apple: "/Logo.png",
    shortcut: "/Logo.png",
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
        <Script 
          src="https://pl28930787.effectivegatecpm.com/ee/e6/5a/eee65a3d8f712ad9de5af5bd8e30ce19.js" 
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
