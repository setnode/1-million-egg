'use client';

import React from 'react';
import { SiteNav } from '@/components/site-nav';
import { Hero } from '@/components/hero';
import { GlobalProgress } from '@/components/global-progress';
import { HowItWorks } from '@/components/how-it-works';
import { Rewards } from '@/components/rewards';
import { Faq } from '@/components/faq';
import { Cta } from '@/components/cta';
import { SiteFooter } from '@/components/site-footer';

export default function LandingPage() {
  return (
    <div className="v0-landing dark fixed inset-0 w-full h-full bg-background text-foreground z-[9999] overflow-y-auto overflow-x-hidden selection:bg-primary/20">
      <SiteNav />
      <main>
        <Hero />
        <GlobalProgress />
        <HowItWorks />
        <Rewards />
        <Faq />
        <Cta />
      </main>
      <SiteFooter />
    </div>
  );
}
