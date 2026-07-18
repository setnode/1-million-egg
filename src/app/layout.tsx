import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://1-million-egg.vercel.app'),
  title: "1 Million Egg",
  description: "Tap the egg. Earn eggs. Claim USDC.",
  openGraph: {
    title: "1 Million Egg 🥚",
    description: "Tap the egg. Earn eggs. Climb the leaderboard and claim USDC rewards!",
    url: "https://1-million-egg.vercel.app",
    siteName: "1 Million Egg",
    images: [
      {
        url: "/egg.png",
        width: 800,
        height: 800,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "1 Million Egg 🥚",
    description: "Tap the egg. Earn eggs. Climb the leaderboard and claim USDC rewards!",
    images: ["/egg.png"],
  },
  other: {
    "base:app_id": "6a5aa2e9a0fe5cd3aaa83293"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
