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
      </body>
    </html>
  );
}
