import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ARFA | AI Lead Generation",
  description: "ARFA helps you capture, qualify, and convert more leads with AI-powered forms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} h-full`}>
      <head>
        <style>{`
          :root {
            --bg: #0A0F1E;
            --surface: #111827;
            --surface-light: #1F2937;
            --accent: #6C63FF;
            --accent-glow: rgba(108,99,255,0.15);
            --border: rgba(255,255,255,0.06);
            --border-hover: rgba(108,99,255,0.3);
            --tx: #F9FAFB;
            --tx2: #9CA3AF;
            --tx3: #6B7280;
            --green: #10B981;
            --green-bg: rgba(16,185,129,0.1);
            --amber: #F59E0B;
            --amber-bg: rgba(245,158,11,0.1);
            --red: #EF4444;
            --red-bg: rgba(239,68,68,0.1);
            --blue: #3B82F6;
            --sidebar: 220px;
            --font-syne: var(--font-syne);
            --font-dm-sans: var(--font-dm-sans);
          }
          body { font-family: var(--font-dm-sans), sans-serif; background: var(--bg); color: var(--tx); }
          .font-syne { font-family: var(--font-syne), sans-serif; }
        `}</style>
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col antialiased bg-[#0A0F1E] text-white font-sans">
        {children}
      </body>
    </html>
  );
}
