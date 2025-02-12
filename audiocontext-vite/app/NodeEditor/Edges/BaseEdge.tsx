import { cn } from '@/lib/utils.ts'
import { memo } from 'react'
import type { UsableEdgeStates } from '../types.ts'
import { useEdge } from './useEdge.ts'

// BaseEdge Component
type BaseEdgeProps = {
  edge: UsableEdgeStates
  onSelect?: (id: string) => void
}

export const BaseEdge = memo(function BaseEdge({ edge, onSelect }: BaseEdgeProps) {
  const { isSelected, handleClick } = useEdge(edge, onSelect)

  return (
    <svg
      className="absolute w-full h-full overflow-visible pointer-events-none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* TODO */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <path
        d={`M ${edge.from.x},${edge.from.y} L ${edge.to.x},${edge.to.y}`}
        className={cn('cursor-pointer', isSelected ? 'stroke-zinc-800' : 'stroke-zinc-400')}
        style={{ pointerEvents: 'visibleStroke' }}
        strokeWidth="2"
        fill="none"
        onClick={handleClick}
      />
    </svg>
  )
})
