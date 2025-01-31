import type { NewEdgeEnd, NewEdgeStart, NodeSnap } from '@/NodeEditor/types'
import { useCallback } from 'react'
import { editorProxy } from './useEditor'

type UseNodeProps = {
  node: NodeSnap
  onNodeSelect: (id: string) => void
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

  const handleConnect = useCallback(
    (e: React.MouseEvent, placement: 'Top' | 'Bottom', index: number) => {
      e.stopPropagation()
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      const boardRect = editorProxy.boardRect
      const offset = placement === 'Top' ? 0 : rect.height
      const borderPX = 1
      const position = {
        x: rect.x + rect.width / 2 - boardRect.x - borderPX,
        y: rect.y + offset - boardRect.y - borderPX,
      }

      if (!editorProxy.isEditingNewEdge) {
        onConnectStart({
          id: `edge-${crypto.randomUUID()}`,
          fromId: node.id,
          from: position,
          to: position,
        })
      } else {
        onConnectEnd({ toId: node.id, to: position, handlePosition: index })
      }
    },
    [node.id, onConnectEnd, onConnectStart],
  )

  return { handleNodeMouseDown, handleConnect }
}
