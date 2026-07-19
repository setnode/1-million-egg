import { Reveal } from '@/components/reveal'

const milestones = [
  { eggs: 30, reward: '0.10' },
  { eggs: 80, reward: '0.50' },
  { eggs: 150, reward: '1.00' },
  { eggs: 650, reward: '5.00' },
  { eggs: 1200, reward: '10.00' },
  { eggs: 5500, reward: '50.00' },
  { eggs: 10500, reward: '100.00' },
]

export function Rewards() {
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
            {milestones.map((m, i) => (
              <li key={m.eggs}>
                <div className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-5 shadow-premium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-premium-lg sm:px-7">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold tabular-nums text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-lg font-semibold tracking-tight text-foreground tabular-nums">
                      {m.eggs.toLocaleString('en-US')} eggs
                    </div>
                    <div className="text-sm text-muted-foreground">Milestone</div>
                  </div>
                  <div className="flex shrink-0 items-baseline gap-1 rounded-full bg-primary px-4 py-2 text-primary-foreground">
                    <span className="text-base font-semibold tabular-nums sm:text-lg">
                      ${m.reward}
                    </span>
                    <span className="text-xs font-medium opacity-80">USDC</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  )
}
