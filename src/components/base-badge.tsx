import { cn } from '@/lib/utils'

export function BaseBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-2 pr-3.5 text-sm font-medium text-muted-foreground shadow-premium',
        className,
      )}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
        <span className="h-2 w-2 rounded-full bg-primary-foreground" />
      </span>
      Powered by Base
    </span>
  )
}
