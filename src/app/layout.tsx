import type { Metadata } from "next";
import "./globals.css";

// You can customize this metadata for your landing page's SEO
export const metadata: Metadata = {
  title: "Mutual Fund Tracker",
  description: "Track your portfolio, analyze overlap, and manage your investments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* If you are using next/font/google, you would apply the font class to the body tag here */}
      <body className="antialiased text-gray-900 bg-white">
        {children}
      </body>
    </html>
  );
}