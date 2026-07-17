import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "1 Million Egg",
  description: "Tap the egg. Earn eggs. Claim USDC.",
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
        <script src="https://cdn.jsdelivr.net/npm/@farcaster/frame-sdk/dist/index.min.js" async></script>
      </body>
    </html>
  );
}
