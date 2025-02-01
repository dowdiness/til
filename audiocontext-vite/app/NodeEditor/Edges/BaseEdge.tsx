import { memo, useCallback, useEffect } from 'react'
import { editorProxy } from '../store.ts'
import type { UsableEdgeStates } from '../types.ts'
import './baseEdge.css'
import { useSelectedEdgeId } from './useSelectedEdgeId.ts'

// BaseEdge Component
type BaseEdgeProps = {
  edge: UsableEdgeStates
  onSelect?: (id: string) => void
}

export const BaseEdge = memo(function BaseEdge({ edge, onSelect }: BaseEdgeProps) {
  const [selectedEdgeId, setSelectedEdgeId] = useSelectedEdgeId()
  const isSelected = edge.id === selectedEdgeId
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // If you have a selected Edge, you can delete it by to type Backspace.
      if (isSelected && e.key === 'Backspace') {
        editorProxy.deleteEdgeById(edge.id)
      }
    },
    [edge.id, isSelected],
  )

  const handleClick = useCallback(() => {
    setSelectedEdgeId(edge.id)
    if (onSelect) {
      onSelect(edge.id)
    }
  }, [onSelect, edge.id, setSelectedEdgeId])

  useEffect(() => {
    if (isSelected) {
      window.addEventListener('keydown', handleKeyDown)
    } else {
      window.removeEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSelected, handleKeyDown])

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
