import type { NewEdgeEnd, NewEdgeStart, NodeID, NodeSnap } from '@/NodeEditor/types'
import { useCallback } from 'react'
import { editorProxy } from './store'

type UseNodeProps = {
  node: NodeSnap
  onNodeSelect: (id: NodeID) => void
  onConnectStart: (edge: NewEdgeStart) => void
  onConnectEnd: (edge: NewEdgeEnd) => void
}

export function useNode({ node, onNodeSelect, onConnectStart, onConnectEnd }: UseNodeProps) {
  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onNodeSelect(node.id)
    },
    [node.id, onNodeSelect],
  )

  const calculatePosition = useCallback((rect: DOMRect, hasOffset: boolean) => {
    const boardRect = editorProxy.boardRect
    const offset = hasOffset ? 0 : rect.height
    // HACK: This is a hack to fix the border offset
    const borderPX = 1
    return {
      x: rect.x + rect.width / 2 - boardRect.x - borderPX,
      y: rect.y + offset - boardRect.y - borderPX,
    }
  }, [])

  const handleConnectStart = useCallback(
    (e: React.MouseEvent, placement: 'Top' | 'Bottom') => {
      e.stopPropagation()
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
    (e: React.MouseEvent, placement: 'Top' | 'Bottom', index: number) => {
      e.stopPropagation()
      const position = calculatePosition(
        (e.target as HTMLElement).getBoundingClientRect(),
        placement === 'Top',
      )
      onConnectEnd({ toId: node.id, to: position, handlePosition: index })
      editorProxy.updateNodeIns(node.id, node.id, index)
    },
    [node.id, onConnectEnd, calculatePosition],
  )

  return { handleNodeMouseDown, handleConnectStart, handleConnectEnd }
}
