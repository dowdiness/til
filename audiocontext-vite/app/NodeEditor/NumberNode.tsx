import { Input } from '@/components/ui/input.tsx'
import { memo, useState } from 'react'
import type { NewEdgeEnd, NewEdgeStart, NodeSnap } from './types.ts'
import { editorProxy } from './useEditor.ts'

type NodeElementProps = {
  node: NodeSnap
  onNodeSelect: (id: string) => void
  onConnectStart: (edge: NewEdgeStart) => void
  onConnectEnd: (edge: NewEdgeEnd) => void
}

// NodeElement Component
export const NumberNode = memo(function BaseNode({
  node,
  onNodeSelect,
  onConnectStart,
  onConnectEnd,
}: NodeElementProps) {
  const [number, setNumber] = useState(node.args[0] ?? 10)
  const handleNodeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    onNodeSelect(node.id)
  }

  const handleConnect = (e: React.MouseEvent, placement: 'Top' | 'Bottom', index: number) => {
    e.stopPropagation()
    // Get clicked connector DOMRect
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const boardRect = editorProxy.boardRect
    // Change handle placement
    // Change position by connection placement
    const offset = placement === 'Top' ? 0 : rect.height
    const boarderPX = 1
    const position = {
      x: rect.x + rect.width / 2 - boardRect.x - boarderPX,
      y: rect.y + offset - boardRect.y - boarderPX,
    }
    // Switch Connect Start/End event
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
  }

  return (
    <div
      className="absolute"
      style={{ transform: `translate(${node.position.x}px, ${node.position.y}px)` }}
    >
      <div className="flex flex-col items-center" onMouseDown={handleNodeMouseDown}>
        <Input
          className="w-20"
          type="number"
          value={number}
          onChange={(e) => setNumber(Number(e.target.value))}
        />
        <div
          className="w-[10px] h-[10px] border rounded-md cursor-pointer border-card-foreground"
          onMouseDown={(e) => handleConnect(e, 'Bottom', 0)}
        />
      </div>
    </div>
  )
})
