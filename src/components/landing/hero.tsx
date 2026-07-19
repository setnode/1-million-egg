import Image from 'next/image'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BaseBadge } from '@/components/landing/base-badge'

export function Hero({ onPlayNow }: { onPlayNow?: () => void }) {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-24">
      {/* soft ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 50% at 78% 40%, rgba(255,255,255,0.03), transparent 70%)',
        }}
      />

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        {/* Left: copy */}
        <div className="flex flex-col items-start">
          <BaseBadge className="animate-fade-up" />

          <h1
            className="mt-8 text-balance text-5xl font-medium leading-[1] tracking-[-0.04em] text-foreground animate-fade-up sm:text-6xl lg:text-[5.5rem]"
            style={{ animationDelay: '80ms' }}
          >
            One tap.
            <br />
            One million eggs.
          </h1>

          <p
            className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground animate-fade-up sm:text-xl"
            style={{ animationDelay: '160ms' }}
          >
            Tap the egg. Collect eggs. Join the global goal of one million, and
            earn real USDC rewards. Built on Base.
          </p>

          <div
            className="mt-10 flex flex-col items-stretch gap-4 animate-fade-up sm:flex-row sm:items-center"
            style={{ animationDelay: '240ms' }}
          >
            <Button onClick={onPlayNow} className="h-14 rounded-full px-10 text-base font-medium shadow-premium-lg transition-transform hover:scale-[1.02]">
              <Play className="mr-1.5 size-5 fill-current" />
              Play Now
            </Button>
            <a href="#rewards">
              <Button
                variant="ghost"
                className="h-14 rounded-full px-8 text-base font-medium text-foreground hover:bg-muted"
              >
                View rewards
                <ArrowRight className="ml-1.5 size-4.5" />
              </Button>
            </a>
          </div>

          <ul
            className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground animate-fade-up"
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
        <div className="relative flex items-center justify-center lg:justify-end lg:translate-x-4 lg:translate-y-4">
          <div className="relative aspect-square w-full max-w-[480px] overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-premium-lg">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at center, rgba(255,255,255,0.12) 0%, transparent 65%)',
              }}
            />
            <div className="flex h-full w-full items-center justify-center p-8 animate-float">
              <Image
                src="/egg.png"
                alt="The 1 Million Egg — a real egg you collect on Base"
                width={640}
                height={640}
                priority
                className="h-auto w-[88%] select-none object-contain drop-shadow-2xl"
              />
            </div>
            <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-xs font-medium text-foreground backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              Live on Base
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
