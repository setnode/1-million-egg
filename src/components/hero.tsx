'use client';

import Image from 'next/image'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BaseBadge } from '@/components/base-badge'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-16">
      {/* soft ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 50% at 78% 40%, oklch(0.955 0.02 262 / 0.9), transparent 70%)',
        }}
      />

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-8">
        {/* Left: copy */}
        <div className="flex flex-col items-start">
          <BaseBadge className="" />

          <h1
            className="mt-6 text-pretty text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground  sm:text-6xl lg:text-[4.25rem]"
            style={{ animationDelay: '80ms' }}
          >
            One tap.
            <br />
            One million eggs.
          </h1>

          <p
            className="mt-6 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground "
            style={{ animationDelay: '160ms' }}
          >
            Tap the egg. Collect eggs. Join the global goal of one million, and
            earn real USDC rewards. Built on Base.
          </p>

          <div
            className="mt-9 flex flex-col items-stretch gap-3  sm:flex-row sm:items-center"
            style={{ animationDelay: '240ms' }}
          >
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <Button onClick={openConnectModal} className="h-13 rounded-full px-8 text-base shadow-premium-lg transition-transform hover:scale-[1.02]">
                  <Play className="mr-0.5 size-5 fill-current" />
                  Play Now
                </Button>
              )}
            </ConnectButton.Custom>
            <a href="#rewards">
              <Button
                variant="ghost"
                className="h-13 rounded-full px-6 text-base text-foreground hover:bg-muted"
              >
                View rewards
                <ArrowRight className="size-4.5" />
              </Button>
            </a>
          </div>

          <ul
            className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground "
            style={{ animationDelay: '320ms' }}
          >
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Connect your wallet
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Tap to collect
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Claim USDC
            </li>
          </ul>
        </div>

        {/* Right: egg */}
        <div className="relative flex items-center justify-center lg:justify-end">
          <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-[2rem] border border-border bg-card shadow-premium-lg">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(60% 55% at 50% 40%, oklch(0.955 0.02 262 / 0.85), transparent 72%)',
              }}
            />
            <div className="flex h-full w-full items-center justify-center p-10 animate-float">
              <Image
                src="/egg.png"
                alt="The 1 Million Egg — a real egg you collect on Base"
                width={640}
                height={640}
                priority
                className="h-auto w-4/5 select-none object-contain drop-shadow-2xl"
              />
            </div>
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Live on Base
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
