'use client';

import { SiteNav } from '@/components/landing/site-nav'
import { SiteFooter } from '@/components/landing/site-footer'

export default function TermsPage() {
  return (
    <div className="v0-landing dark fixed inset-0 w-full h-full overflow-y-auto overflow-x-hidden selection:bg-primary/20 bg-background font-sans antialiased text-foreground">
      <div className="min-h-screen flex flex-col bg-background">
        <SiteNav />
        <main className="flex-1 pt-32 pb-24">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <div className="mb-12">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Terms of Service</h1>
              <p className="mt-4 text-muted-foreground">Last updated: July 2026</p>
            </div>

            <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-muted-foreground prose-li:text-muted-foreground prose-headings:text-foreground prose-headings:font-semibold">
              <p>By accessing or using 1 Million Egg, you agree to these Terms.</p>

              <h2 className="text-2xl mt-12 mb-6">Eligibility</h2>
              <p className="mb-8">
                You are responsible for complying with the laws applicable in your jurisdiction.
              </p>

              <h2 className="text-2xl mt-12 mb-6">Wallet</h2>
              <p className="mb-8">
                You are solely responsible for the security of your wallet and private keys.
              </p>

              <h2 className="text-2xl mt-12 mb-6">Rewards</h2>
              <p className="mb-4">
                Rewards are distributed according to the rules published within the application.
              </p>
              <p className="mb-8">
                Reward amounts, eligibility, and distribution rules may change over time.
              </p>

              <h2 className="text-2xl mt-12 mb-6">Abuse</h2>
              <p className="mb-4">Users may not:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>exploit bugs</li>
                <li>automate gameplay without permission</li>
                <li>manipulate leaderboards</li>
                <li>abuse reward systems</li>
                <li>attempt to attack or disrupt the platform</li>
              </ul>
              <p className="mb-8">
                Violation may result in suspension or removal of rewards.
              </p>

              <h2 className="text-2xl mt-12 mb-6">Blockchain Risks</h2>
              <p className="mb-4">
                Blockchain networks may experience congestion, delays, outages, or unexpected behavior.
              </p>
              <p className="mb-8">
                We are not responsible for losses caused by third-party blockchain infrastructure.
              </p>

              <h2 className="text-2xl mt-12 mb-6">No Financial Advice</h2>
              <p className="mb-4">
                1 Million Egg is an entertainment and engagement platform.
              </p>
              <p className="mb-8">
                Nothing provided by the application constitutes financial, investment, tax, or legal advice.
              </p>

              <h2 className="text-2xl mt-12 mb-6">Limitation of Liability</h2>
              <p className="mb-4">
                The application is provided "as is" without warranties of any kind.
              </p>
              <p className="mb-8">
                To the maximum extent permitted by law, we are not liable for indirect or consequential damages arising from use of the platform.
              </p>

              <h2 className="text-2xl mt-12 mb-6">Changes</h2>
              <p className="mb-4">
                We may update these Terms at any time.
              </p>
              <p className="mb-8">
                Continued use of the application constitutes acceptance of the updated Terms.
              </p>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
