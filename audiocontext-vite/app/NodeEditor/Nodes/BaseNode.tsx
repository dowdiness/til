import { NodeContext } from '@/components/ui/NodeUI.tsx'
import { memo } from 'react'
import type { NewEdgeEnd, NewEdgeStart, NodeID, NodeSnap } from '../types.ts'
import { useNode } from './useNode.ts'

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
  const { isSelected, handleNodePointerDown, handleConnectStart, handleConnectEnd } = useNode({
    node,
    onNodeSelect,
    onConnectStart,
    onConnectEnd,
  })

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
        onPointerDown={handleNodePointerDown}
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
