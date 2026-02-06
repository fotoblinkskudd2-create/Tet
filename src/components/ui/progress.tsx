import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  max?: number
  color?: string
  className?: string
  showLabel?: boolean
}

export function Progress({ value, max = 100, color = '#0b85f0', className, showLabel }: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)
  const isOver = value > max

  return (
    <div className={cn('space-y-1', className)}>
      <div className="h-2.5 rounded-full bg-slate-700/50 overflow-hidden shadow-neu-inset">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: isOver ? '#ef4444' : color,
          }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-400">
          <span>{Math.round(percentage)}%</span>
          {isOver && <span className="text-red-400">Over budsjett!</span>}
        </div>
      )}
    </div>
  )
}
