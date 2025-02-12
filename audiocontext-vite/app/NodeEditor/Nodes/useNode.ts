import type { NewEdgeEnd, NewEdgeStart, NodeID, NodeSnap } from '@/NodeEditor/types'
import { useCallback } from 'react'
import { editorProxy } from '../store'
import { boardElement } from '../useBoardRef'
import { useTemporalEdge } from '../useTemporalEdge'
import { useSelectedNodeId } from './useSelectedNodeId'

type UseNodeProps = {
  node: NodeSnap
  onNodeSelect?: (id: NodeID) => void
  onConnectStart: (edge: NewEdgeStart) => void
  onConnectEnd: (edge: NewEdgeEnd) => void
}

export function useNode({ node, onNodeSelect, onConnectStart, onConnectEnd }: UseNodeProps) {
  const [, setSelectedNodeId] = useSelectedNodeId()
  const [, setTemporalEdge] = useTemporalEdge()

  const handleNodeSelect = useCallback(
    (id: NodeID) => {
      setSelectedNodeId(id)
      setTemporalEdge(null)
      onNodeSelect?.(id)
    },
    [setSelectedNodeId, setTemporalEdge, onNodeSelect],
  )

  const handleNodePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation()
      if (e.target instanceof HTMLElement) {
        e.target.setPointerCapture(e.pointerId)
      }
      handleNodeSelect(node.id)
    },
    [node.id, handleNodeSelect],
  )

  const calculatePosition = useCallback((rect: DOMRect, hasOffset: boolean) => {
    const boardRect = boardElement.getBoundingClientRect()
    const offset = hasOffset ? 0 : rect.height
    // HACK: This is a hack to fix the border offset
    const borderPX = 1
    return {
      x: rect.x + rect.width / 2 - boardRect.x - borderPX,
      y: rect.y + offset - boardRect.y - borderPX,
    }
  }, [])

  const handleConnectStart = useCallback(
    (e: React.PointerEvent, placement: 'Top' | 'Bottom') => {
      e.stopPropagation()
      if (e.target instanceof HTMLElement) {
        e.target.setPointerCapture(e.pointerId)
      }
      const position = calculatePosition(
        (e.target as HTMLElement).getBoundingClientRect(),
        placement === 'Top',
      )

      onConnectStart({
        id: `edge-${crypto.randomUUID()}`,
        fromId: node.id,
        from: position,
        to: position,
      })
    },
    [node.id, onConnectStart, calculatePosition],
  )

  const handleConnectEnd = useCallback(
    (e: React.PointerEvent, placement: 'Top' | 'Bottom', index: number) => {
      e.stopPropagation()
      if (e.target instanceof HTMLElement) {
        e.target.releasePointerCapture(e.pointerId)
      }
      const position = calculatePosition(
        (e.target as HTMLElement).getBoundingClientRect(),
        placement === 'Top',
      )
      onConnectEnd({ toId: node.id, to: position, handlePosition: index })
      editorProxy.updateNodeIns(node.id, node.id, index)
    },
    [node.id, onConnectEnd, calculatePosition],
  )

  return { handleNodePointerDown, handleConnectStart, handleConnectEnd }
}
