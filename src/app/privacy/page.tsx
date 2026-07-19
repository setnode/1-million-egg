'use client';

import { SiteNav } from '@/components/landing/site-nav'
import { SiteFooter } from '@/components/landing/site-footer'
import { useConnectModal } from '@rainbow-me/rainbowkit'

export default function PrivacyPage() {
  return (
    <div className="v0-landing dark fixed inset-0 w-full h-full overflow-y-auto overflow-x-hidden selection:bg-primary/20 bg-background font-sans antialiased text-foreground">
      <div className="min-h-screen flex flex-col bg-background">
        <SiteNav />
        <main className="flex-1 pt-32 pb-24">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <div className="mb-12">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Privacy Policy</h1>
              <p className="mt-4 text-muted-foreground">Last updated: July 2026</p>
            </div>

            <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-muted-foreground prose-li:text-muted-foreground prose-headings:text-foreground prose-headings:font-semibold">
              <p>Welcome to 1 Million Egg.</p>

              <p>Your privacy matters to us. This Privacy Policy explains what information we collect and how we use it.</p>

              <h2 className="text-2xl mt-12 mb-6">Information We Collect</h2>
              <ul className="list-disc pl-6 space-y-2 mb-8">
                <li>Wallet address (when you connect your wallet)</li>
                <li>Onchain activity related to the application</li>
                <li>Basic analytics such as page visits and device information</li>
                <li>Reward and leaderboard data</li>
              </ul>

              <h3 className="text-xl mt-8 mb-4">We do not collect:</h3>
              <ul className="list-disc pl-6 space-y-2 mb-8">
                <li>Passwords</li>
                <li>Private keys</li>
                <li>Seed phrases</li>
                <li>Personal identity information unless you voluntarily provide it.</li>
              </ul>

              <h2 className="text-2xl mt-12 mb-6">How We Use Information</h2>
              <p className="mb-4">Information is used to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-8">
                <li>operate the application</li>
                <li>calculate rewards</li>
                <li>maintain leaderboards</li>
                <li>improve the platform</li>
                <li>prevent abuse and fraudulent activity</li>
              </ul>

              <h2 className="text-2xl mt-12 mb-6">Blockchain Data</h2>
              <p className="mb-8">
                Transactions performed on Base are public blockchain records and cannot be modified or deleted by us.
              </p>

              <h2 className="text-2xl mt-12 mb-6">Cookies</h2>
              <p className="mb-8">
                We may use cookies or similar technologies to improve your experience and understand usage patterns.
              </p>

              <h2 className="text-2xl mt-12 mb-6">Third-Party Services</h2>
              <p className="mb-4">The application may use services including:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Base</li>
                <li>Wallet providers</li>
                <li>RPC providers</li>
                <li>Analytics providers</li>
              </ul>
              <p className="mb-8">Each service has its own privacy practices.</p>

              <h2 className="text-2xl mt-12 mb-6">Data Security</h2>
              <p className="mb-8">
                We take reasonable measures to protect our infrastructure, but no online service can guarantee absolute security.
              </p>

              <h2 className="text-2xl mt-12 mb-6">Children</h2>
              <p className="mb-8">
                1 Million Egg is not intended for children under the age required by applicable laws.
              </p>

              <h2 className="text-2xl mt-12 mb-6">Changes</h2>
              <p className="mb-8">
                This Privacy Policy may be updated from time to time.
              </p>

              <h2 className="text-2xl mt-12 mb-6">Contact</h2>
              <p className="mb-8">
                For questions, contact us through our official X or Farcaster accounts.
              </p>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
