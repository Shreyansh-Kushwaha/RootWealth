"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: "Mutual Fund Tracker",
//   description: "Privacy-first mutual fund simulator for Indian investors",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <html
      lang="en"
      data-theme="light"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[color:var(--background)] text-[color:var(--foreground)]">
        <div className="grid grid-cols-[auto_1fr] gap-6 max-w-7xl mx-auto px-4 py-6">
          <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
