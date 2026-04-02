"use client";

import Sidebar from "@/components/Sidebar";
import { useState } from "react";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    // Notice there are no <html> or <body> tags here!
    // Just a container div for your dashboard structure.
    <div className="grid grid-cols-[auto_1fr] gap-6 max-w-7xl mx-auto px-4 py-6 h-full min-h-screen">
      <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
      <main className="w-full">{children}</main>
    </div>
  );
}