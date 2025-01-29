import { memo } from 'react'
import { editorProxy } from './useEditor.ts'
import type { NodeSnap, NewEdgeStart, NewEdgeEnd } from './types.ts'
import './baseNode.css'

type NodeElementProps = {
  node: NodeSnap;
  onNodeSelect: (id: string) => void;
  onConnectStart: (edge: NewEdgeStart) => void;
  onConnectEnd: (edge: NewEdgeEnd) => void;
}

// HACK
let count = 1

// NodeElement Component
export const BaseNode = memo(function BaseNode({
  node,
  onNodeSelect,
  onConnectStart,
  onConnectEnd
}: NodeElementProps) {
  const handleNodeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    onNodeSelect(node.id)
  }

  const handleConnect = (
    e: React.MouseEvent,
    placement: 'Top' | 'Bottom',
    index: number
  ) => {
    e.stopPropagation()
    // Get clicked connector DOMRect
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const boardRect = editorProxy.boardRect
    // Change handle placement
    // Change position by connection placement
    const offset = placement === 'Top' ? 0 : rect.height
    const boarderPX = 1
    const position = {
      x: rect.x + (rect.width / 2) - boardRect.x - boarderPX,
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
      <div className="flex flex-col items-center">
        <div className="flex w-full justify-evenly">
          {node.ins.map((_inlet, i) => {
            return (
              <div
                className="connector"
                key={count++}
                onMouseDown={(e) => handleConnect(e, 'Top', i)}
              ></div>
            )
          })}
          </div>
        <div
          className="node"
          onMouseDown={handleNodeMouseDown}
        >
          {node.type}
        </div>
        <div
          className="connector"
          onMouseDown={(e) => handleConnect(e, 'Bottom', 0)}
        ></div>
      </div>
    </div>
  )
})
