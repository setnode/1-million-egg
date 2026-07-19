'use client'

import { Accordion } from '@base-ui/react/accordion'
import { ChevronDown } from 'lucide-react'
import { Reveal } from '@/components/reveal'

const faqs = [
  {
    q: 'What is 1 Million Egg?',
    a: 'A shared goal on Base. Collectors connect their wallet, tap the egg, and collect eggs that count toward a global total of one million.',
  },
  {
    q: 'How do I start?',
    a: 'Connect your wallet, then tap the egg and complete daily activities to collect eggs and raise your global score.',
  },
  {
    q: 'How do rewards work?',
    a: 'Each reward milestone has a fixed USDC value. When you reach a milestone, you can claim the corresponding USDC reward to your wallet.',
  },
  {
    q: 'What rewards can I earn?',
    a: 'Rewards range from $0.10 USDC at 30 eggs up to $100 USDC at 10,500 eggs. See the Rewards section for the full list of milestones.',
  },
  {
    q: 'Is it built on Base?',
    a: 'Yes. 1 Million Egg runs on Base, an Ethereum Layer 2. Rewards are paid in USDC.',
  },
]

export function Faq() {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <Reveal>
          <div className="text-center">
            <span className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
              FAQ
            </span>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Questions, answered
            </h2>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <Accordion.Root className="mt-12 space-y-3">
            {faqs.map((faq) => (
              <Accordion.Item
                key={faq.q}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-premium"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-base font-medium text-foreground outline-none transition-colors hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/40">
                    {faq.q}
                    <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-data-[panel-open]:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Panel className="h-[var(--accordion-panel-height)] overflow-hidden text-muted-foreground transition-[height] duration-300 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0">
                  <p className="px-6 pb-6 pt-0 text-pretty leading-relaxed">
                    {faq.a}
                  </p>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </Reveal>
      </div>
    </section>
  )
}
