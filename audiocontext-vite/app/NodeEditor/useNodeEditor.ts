import { useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { temporalEdgeAtom, updateTemporalEdgePositionAtom } from './Edges/temporalEdgeAtom'
import { updateNodeEditorPositionsAtom } from './Nodes/selectedNodeIdAtom'

export const useNodeEditor = () => {
  const setTemporalEdge = useSetAtom(temporalEdgeAtom)
  const updateTemporalEdgePosition = useSetAtom(updateTemporalEdgePositionAtom)
  const updateNodeEditorPositions = useSetAtom(updateNodeEditorPositionsAtom)

  const handlePointerDownContainer = useCallback(
    (e: React.PointerEvent) => {
      setTemporalEdge(null)
      if (e.target instanceof HTMLElement) {
        e.target.setPointerCapture(e.pointerId)
      }
    },
    [setTemporalEdge],
  )

  const handlePointerUpContainer = useCallback((e: React.PointerEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.releasePointerCapture(e.pointerId)
    }
  }, [])

  const handlePointerMoveContainer = useCallback(
    (e: React.PointerEvent) => {
      updateTemporalEdgePosition({ x: e.clientX, y: e.clientY })
      updateNodeEditorPositions({ x: e.movementX, y: e.movementY })
    },
    [updateNodeEditorPositions, updateTemporalEdgePosition],
  )

  return {
    handlePointerDownContainer,
    handlePointerUpContainer,
    handlePointerMoveContainer,
  }
}
