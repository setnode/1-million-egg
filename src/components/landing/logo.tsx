import Image from 'next/image'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-3', className)}>
      <span className="relative flex h-8 w-8 items-center justify-center">
        <Image
          src="/egg.png"
          alt="1 Million Egg Logo"
          width={32}
          height={32}
          className="h-full w-full object-contain drop-shadow-md"
        />
      </span>
      <span className="text-[17px] font-semibold tracking-tight text-foreground">
        1 Million Egg
      </span>
    </span>
  )
}
