import type { Metadata } from "next";
import "./globals.css";
import CRTOverlay from "@/components/vaporwave/CRTOverlay";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "CONNECT FOUR — Neon Grid",
  description: "Drop your line. Dominate the grid. A retro-futuristic Connect Four experience with AI coach, real-time multiplayer, and neon aesthetics.",
  openGraph: {
    title: "CONNECT FOUR — Neon Grid",
    description: "Drop your line. Dominate the grid.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#090014] text-[#E0E0E0] min-h-screen overflow-x-hidden">
        <CRTOverlay />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
