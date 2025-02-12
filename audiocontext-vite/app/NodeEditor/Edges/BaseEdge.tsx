import { memo } from 'react'
import type { UsableEdgeStates } from '../types.ts'
import './baseEdge.css'
import { useEdge } from './useEdge.ts'

// BaseEdge Component
type BaseEdgeProps = {
  edge: UsableEdgeStates
  onSelect?: (id: string) => void
}

export const BaseEdge = memo(function BaseEdge({ edge, onSelect }: BaseEdgeProps) {
  const { isSelected, handleClick } = useEdge(edge, onSelect)

  return (
    <svg className="svg" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">
      {/* TODO */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <path
        d={`M ${edge.from.x},${edge.from.y} L ${edge.to.x},${edge.to.y}`}
        className={isSelected ? 'stroke-zinc-800' : 'stroke-zinc-400'}
        strokeWidth="2"
        fill="none"
        onClick={handleClick}
      />
    </svg>
  )
})
