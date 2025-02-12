import type { NewEdgeEnd, NewEdgeStart, NodeID, NodeSnap } from '@/NodeEditor/types'
import { useAtom } from 'jotai'
import { useCallback } from 'react'
import { editorProxy } from '../store'
import { containerElement } from '../useContainerRef'
import { selectedNodeIdAtom } from './selectedNodeIdAtom'

type UseNodeProps = {
  node: NodeSnap
  onNodeSelect?: (id: NodeID) => void
  onConnectStart: (edge: NewEdgeStart) => void
  onConnectEnd: (edge: NewEdgeEnd) => void
}

const calculatePosition = (rect: DOMRect, hasOffset: boolean) => {
  const containerRect = containerElement.getBoundingClientRect()
  const offset = hasOffset ? 0 : rect.height
  // HACK: This is a hack to fix the border offset
  const borderPX = 1
  return {
    x: rect.x + rect.width / 2 - containerRect.x - borderPX,
    y: rect.y + offset - containerRect.y - borderPX,
  }
}

export function useNode({ node, onNodeSelect, onConnectStart, onConnectEnd }: UseNodeProps) {
  const [selectedNodeId, setSelectedNodeId] = useAtom(selectedNodeIdAtom)
  const isSelected = node.id === selectedNodeId

  const handleNodePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation()
      if (e.target instanceof HTMLElement) {
        e.target.setPointerCapture(e.pointerId)
      }
      setSelectedNodeId(node.id)
      onNodeSelect?.(node.id)
    },
    [node.id, setSelectedNodeId, onNodeSelect],
  )

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

      console.log(position)
      const newEdge = {
        id: `edge-${crypto.randomUUID()}`,
        fromId: node.id,
        from: position,
        to: position,
      } as const

      onConnectStart(newEdge)
    },
    [node.id, onConnectStart],
  )

  const handleConnectEnd = useCallback(
    (e: React.PointerEvent, placement: 'Top' | 'Bottom', index: number) => {
      e.stopPropagation()
      if (e.target instanceof HTMLElement) {
        e.target.releasePointerCapture(e.pointerId)
        const position = calculatePosition(e.target.getBoundingClientRect(), placement === 'Top')
        onConnectEnd({ toId: node.id, to: position, handlePosition: index })
      }
      editorProxy.updateNodeIns(node.id, node.id, index)
    },
    [node.id, onConnectEnd],
  )

  return { isSelected, handleNodePointerDown, handleConnectStart, handleConnectEnd }
}
