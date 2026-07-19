'use client'

import { useEffect, useState } from 'react'
import { Reveal } from '@/components/landing/reveal'
import { REWARD_TIERS } from '@/constants/rewards'

export function Rewards() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <section id="rewards" className="py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
              Rewards
            </span>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Reach a milestone. Claim USDC.
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Collect eggs to reach each milestone. Every milestone unlocks a
              fixed USDC reward, claimed directly to your wallet.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <ol className="mt-14 space-y-3">
            {!isMounted ? (
              // Skeleton Loading State
              Array.from({ length: 7 }).map((_, i) => (
                <li key={i}>
                  <div className="flex h-[88px] items-center gap-4 rounded-2xl border border-border bg-card px-5 py-5 shadow-premium sm:px-7">
                    <span className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-muted" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-16 animate-pulse rounded bg-muted/60" />
                    </div>
                    <div className="h-10 w-24 shrink-0 animate-pulse rounded-full bg-muted" />
                  </div>
                </li>
              ))
            ) : (
              // Actual Data
              REWARD_TIERS.map((m, i) => (
                <li key={m.tier}>
                  <div className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-5 shadow-premium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-premium-lg sm:px-7">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold tabular-nums text-primary">
                      {m.tier}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-lg font-semibold tracking-tight text-foreground tabular-nums">
                        {m.eggs.toLocaleString('en-US')} eggs
                      </div>
                      <div className="text-sm text-muted-foreground">Milestone</div>
                    </div>
                    <div className="flex shrink-0 items-baseline gap-1 rounded-full bg-primary px-4 py-2 text-primary-foreground">
                      <span className="text-base font-semibold tabular-nums sm:text-lg">
                        ${m.usdc.toFixed(2)}
                      </span>
                      <span className="text-xs font-medium opacity-80">USDC</span>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ol>
        </Reveal>
      </div>
    </section>
  )
}
