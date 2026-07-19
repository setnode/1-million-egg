'use client';

import { useConnectModal } from '@rainbow-me/rainbowkit'
import { SiteNav } from '@/components/landing/site-nav'
import { Hero } from '@/components/landing/hero'
import { GlobalProgress } from '@/components/landing/global-progress'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Rewards } from '@/components/landing/rewards'
import { Faq } from '@/components/landing/faq'
import { Cta } from '@/components/landing/cta'
import { SiteFooter } from '@/components/landing/site-footer'

export function LandingPage() {
  const { openConnectModal } = useConnectModal();

  const handlePlayNow = () => {
    if (openConnectModal) {
      openConnectModal();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>
        <Hero onPlayNow={handlePlayNow} />
        <GlobalProgress />
        <HowItWorks />
        <Rewards />
        <Faq />
        <Cta onPlayNow={handlePlayNow} />
      </main>
      <SiteFooter />
    </div>
  )
}
