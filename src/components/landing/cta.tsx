import Image from 'next/image'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BaseBadge } from '@/components/landing/base-badge'
import { Reveal } from '@/components/landing/reveal'

export function Cta({ onPlayNow }: { onPlayNow?: () => void }) {
  return (
    <section className="pb-24 sm:pb-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-foreground px-6 py-16 text-center shadow-premium-lg sm:px-16 sm:py-20">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(50% 60% at 50% 0%, oklch(0.52 0.24 262 / 0.45), transparent 70%)',
              }}
            />
            <div className="relative flex flex-col items-center">
              <div className="mb-8 animate-float">
                <Image
                  src="/egg-glow.png"
                  alt=""
                  width={140}
                  height={140}
                  className="h-28 w-28 select-none object-contain drop-shadow-2xl sm:h-32 sm:w-32"
                />
              </div>
              <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight text-background sm:text-5xl">
                Be part of the first million.
              </h2>
              <p className="mt-5 max-w-lg text-pretty text-lg leading-relaxed text-background/70">
                Connect your wallet, tap the egg, and collect toward the global
                goal. Reach a milestone to claim USDC.
              </p>
              <div className="mt-9 flex flex-col items-center gap-4">
                <Button 
                  onClick={onPlayNow}
                  className="h-13 rounded-full bg-primary px-8 text-base text-primary-foreground shadow-premium-lg transition-transform hover:scale-[1.02]"
                >
                  <Play className="mr-0.5 size-5 fill-current" />
                  Play Now
                </Button>
                <BaseBadge className="border-background/15 bg-background/10 text-background/70" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
