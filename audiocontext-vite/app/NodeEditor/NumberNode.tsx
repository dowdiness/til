import { NodeContext } from '@/components/ui/NodeUI.tsx'
import { Input } from '@/components/ui/input.tsx'
import { memo, useState } from 'react'
import { editorProxy } from './store.ts'
import type { NewEdgeEnd, NewEdgeStart, NodeID, NodeSnap } from './types.ts'
import { useNode } from './useNode.ts'

type NodeElementProps = {
  node: NodeSnap
  isSelected: boolean
  onNodeSelect: (id: NodeID) => void
  onConnectStart: (edge: NewEdgeStart) => void
  onConnectEnd: (edge: NewEdgeEnd) => void
}

// NodeElement Component
export const NumberNode = memo(function BaseNode({
  node,
  isSelected,
  onNodeSelect,
  onConnectStart,
  onConnectEnd,
}: NodeElementProps) {
  const [number, setNumber] = useState(node.args[0] ?? 10)
  const { handleNodeMouseDown, handleConnectStart, handleConnectEnd } = useNode({
    node,
    onNodeSelect,
    onConnectStart,
    onConnectEnd,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumber(Number(e.target.value))
    editorProxy.updateNodeArgs(node.id, [Number(e.target.value)])
  }

  return (
    <NodeContext node={node}>
      <NodeContext.Node
        className={isSelected ? 'is-dragging' : ''}
        onMouseDown={handleNodeMouseDown}
      >
        <Input className="w-20" type="number" value={number} onChange={handleChange} />
      </NodeContext.Node>
      <NodeContext.Connector
        onConnectStart={(e) => handleConnectStart(e, 'Bottom')}
        onConnectEnd={(e) => handleConnectEnd(e, 'Bottom', 0)}
      />
    </NodeContext>
  )
})
