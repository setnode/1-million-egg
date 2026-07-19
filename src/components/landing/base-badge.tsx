import { cn } from '@/lib/utils'

export function BaseBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-2 pr-3.5 text-sm font-medium text-muted-foreground shadow-premium',
        className,
      )}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-[#0052FF]" />
      Powered by Base
    </span>
  )
}
