import { NodeContext } from '@/components/ui/NodeUI.tsx'
import { memo } from 'react'
import type { NewEdgeEnd, NewEdgeStart, NodeID, NodeSnap } from '../types.ts'
import { useNode } from './useNode.ts'
import { useSelectedNodeId } from './useSelectedNodeId.ts'

type NodeElementProps = {
  node: NodeSnap
  onNodeSelect?: (id: NodeID) => void
  onConnectStart: (edge: NewEdgeStart) => void
  onConnectEnd: (edge: NewEdgeEnd) => void
}

export const BaseNode = memo(function BaseNode({
  node,
  onNodeSelect,
  onConnectStart,
  onConnectEnd,
}: NodeElementProps) {
  const { handleNodeMouseDown, handleConnectStart, handleConnectEnd } = useNode({
    node,
    onNodeSelect,
    onConnectStart,
    onConnectEnd,
  })
  const [selectedNodeId] = useSelectedNodeId()
  const isSelected = node.id === selectedNodeId

  return (
    <NodeContext node={node}>
      <NodeContext.Connectors
        connector={(i) => (
          <NodeContext.Connector
            key={`${node.id}-connector-${i}`}
            onConnectStart={(e) => handleConnectStart(e, 'Top')}
            onConnectEnd={(e) => handleConnectEnd(e, 'Top', i)}
          />
        )}
      />
      <NodeContext.Node
        className={isSelected ? 'is-dragging' : ''}
        onMouseDown={handleNodeMouseDown}
      >
        {node.type}
      </NodeContext.Node>
      <NodeContext.Connector
        onConnectStart={(e) => handleConnectStart(e, 'Bottom')}
        onConnectEnd={(e) => handleConnectEnd(e, 'Top', 0)}
      />
    </NodeContext>
  )
})
