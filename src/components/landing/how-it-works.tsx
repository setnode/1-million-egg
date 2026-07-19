import { Wallet, Hand, Coins, Gift } from 'lucide-react'
import { Reveal } from '@/components/landing/reveal'

const steps = [
  {
    icon: Wallet,
    step: '01',
    title: 'Connect',
    description: 'Connect your wallet to get started on Base.',
  },
  {
    icon: Hand,
    step: '02',
    title: 'Tap',
    description:
      'Tap the egg and complete daily activities to collect eggs.',
  },
  {
    icon: Coins,
    step: '03',
    title: 'Climb',
    description:
      'Your eggs raise your global score and move you up the leaderboard.',
  },
  {
    icon: Gift,
    step: '04',
    title: 'Claim',
    description:
      'Reach a reward milestone and claim USDC directly to your wallet.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <span className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
              How it works
            </span>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Simple from the first tap.
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Connect, tap, and collect. Reach milestones to earn USDC rewards.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal key={step.step} delay={i * 100}>
              <div className="group h-full rounded-3xl border border-border bg-card p-8 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <step.icon className="size-6" />
                  </span>
                  <span className="text-sm font-medium tabular-nums text-muted-foreground/70">
                    {step.step}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
