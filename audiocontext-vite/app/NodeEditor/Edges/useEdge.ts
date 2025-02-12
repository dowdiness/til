import { useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { editorProxy } from '../store.ts'
import type { UsableEdgeStates } from '../types.ts'
import { selectedEdgeIdAtom } from './selectedEdgeIdAtom.ts'

export function useEdge(edge: UsableEdgeStates, onSelect?: (id: string) => void) {
  const [selectedEdgeId, setSelectedEdgeId] = useAtom(selectedEdgeIdAtom)
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

  return {
    isSelected,
    handleClick,
  }
}
