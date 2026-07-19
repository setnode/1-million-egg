import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-premium">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-4.5 w-4.5"
          aria-hidden="true"
        >
          <path
            d="M12 2.5C8.7 6 6 10.2 6 14a6 6 0 0 0 12 0c0-3.8-2.7-8-6-11.5Z"
            fill="var(--color-primary-foreground)"
          />
          <path
            d="M9.4 12.4c.3-1.6 1.1-3 2.2-4.1"
            stroke="var(--color-primary)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="text-[17px] font-semibold tracking-tight text-foreground">
        1 Million Egg
      </span>
    </span>
  )
}
