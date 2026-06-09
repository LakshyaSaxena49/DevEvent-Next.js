import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono, Inter } from "next/font/google";
import "./globals.css";
import LightRays from "@/components/LightRays";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  subsets: ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "DevEvent",
  description: "Hub for Every Dev Event You wouldn't want to miss!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("min-h-screen", "antialiased", schibstedGrotesk.variable, martianMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-screen flex flex-col">

      <Navbar />

        <div className="fixed inset-0 -z-10">
          <LightRays
            raysOrigin="top-center-offset"
            raysColor="#5dfeca"
            raysSpeed={1}
            lightSpread={0.9}
            rayLength={3}
            followMouse={true}
            mouseInfluence={0.3}
            noiseAmount={0}
            distortion={0}
            className="custom-rays"
            pulsating={false}
            fadeDistance={1}
            saturation={1}
          />
        </div>

        <main className="flex-1">
          {children}
        </main>

      </body>
    </html>
  );
}
