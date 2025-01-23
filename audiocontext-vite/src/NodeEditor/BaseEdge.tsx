import { useEffect, useCallback } from 'react';
import { editorProxy } from './useEditor.ts'
import type { UsableEdgeStates } from './types.ts'
import './baseEdge.css'

// BaseEdge Component
type BaseEdgeProps = {
  edge: UsableEdgeStates
  isSelected: boolean
  onSelect?: (id: string) => void
}

export function BaseEdge({ edge, isSelected, onSelect }: BaseEdgeProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // If you have a selected Edge, you can delete it by to type Backspace.
    if (editorProxy.selectedEdgeId === edge.id && e.key === 'Backspace') {
      editorProxy.deleteEdgeById(edge.id)
    }
  }, [edge.id])

  const handleClick = useCallback(() => {
    editorProxy.selectedEdgeId = edge.id
    if (onSelect) {
      onSelect(edge.id)
    }
  }, [onSelect, edge.id])

  useEffect(() => {
    if (isSelected) {
      window.addEventListener('keydown', handleKeyDown)
    } else {
      window.removeEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSelected])

  return (
    <svg className="svg">
      <path
        d={`M ${edge.from.x},${edge.from.y} L ${edge.to.x},${edge.to.y}`}
        className={isSelected ? 'stroke-gray-800' : 'stroke-gray-400'}
        strokeWidth="2"
        fill="none"
        onClick={handleClick}
      />
    </svg>
  );
}
