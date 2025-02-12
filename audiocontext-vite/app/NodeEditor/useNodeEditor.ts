import { useConnect } from '@/NodeEditor/useConnect'
import { useAtom } from 'jotai'
import { useCallback } from 'react'
import { selectedNodeIdAtom } from './Nodes/selectedNodeIdAtom'
import { editorProxy } from './store'

export const useNodeEditor = () => {
  const [selectedNodeId, setSelectedNodeId] = useAtom(selectedNodeIdAtom)
  const { setTemporalEdge, handleUpdateTemporalEdgePosition } = useConnect()

  const handlePointerDownContainer = useCallback(
    (e: React.PointerEvent) => {
      setTemporalEdge(null)
      if (e.target instanceof HTMLElement) {
        e.target.setPointerCapture(e.pointerId)
      }
    },
    [setTemporalEdge],
  )

  const handlePointerUpContainer = useCallback(
    (e: React.PointerEvent) => {
      setSelectedNodeId(null)
      if (e.target instanceof HTMLElement) {
        e.target.releasePointerCapture(e.pointerId)
      }
    },
    [setSelectedNodeId],
  )

  const handlePointerMoveContainer = useCallback(
    (e: React.PointerEvent) => {
      // Update temporal edge position
      handleUpdateTemporalEdgePosition({ x: e.clientX, y: e.clientY })
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
    [selectedNodeId, handleUpdateTemporalEdgePosition],
  )

  return {
    handlePointerDownContainer,
    handlePointerUpContainer,
    handlePointerMoveContainer,
  }
}
