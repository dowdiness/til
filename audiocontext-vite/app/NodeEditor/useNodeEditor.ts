import { useAtom, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { temporalEdgeAtom, updateTemporalEdgePositionAtom } from './Edges/temporalEdgeAtom'
import { selectedNodeIdAtom } from './Nodes/selectedNodeIdAtom'
import { editorProxy } from './store'

export const useNodeEditor = () => {
  const [selectedNodeId] = useAtom(selectedNodeIdAtom)
  const setTemporalEdge = useSetAtom(temporalEdgeAtom)
  const updateTemporalEdgePosition = useSetAtom(updateTemporalEdgePositionAtom)

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
      // Update temporal edge position
      updateTemporalEdgePosition({ x: e.clientX, y: e.clientY })
      // Update objects position if selected node exists
      if (selectedNodeId) {
        const { nodes } = editorProxy
        const selectedNode = nodes.find((node) => node.id === selectedNodeId)
        // Skip update if selected Node is not found
        if (!selectedNode) return
        // Update nodes position
        editorProxy.updateNodes(selectedNode, { x: e.movementX, y: e.movementY })
        // Update edges position
        editorProxy.updateEdges(selectedNode, { x: e.movementX, y: e.movementY })
      }
    },
    [selectedNodeId, updateTemporalEdgePosition],
  )

  return {
    handlePointerDownContainer,
    handlePointerUpContainer,
    handlePointerMoveContainer,
  }
}
