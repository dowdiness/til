import { NodeContext } from '@/components/ui/NodeUI.tsx'
import { memo } from 'react'
import type { NewEdgeEnd, NewEdgeStart, NodeSnap } from './types.ts'
import { useNode } from './useNode.ts'

type NodeElementProps = {
  node: NodeSnap
  isSelected: boolean
  onNodeSelect: (id: string) => void
  onConnectStart: (edge: NewEdgeStart) => void
  onConnectEnd: (edge: NewEdgeEnd) => void
}

export const BaseNode = memo(function BaseNode({
  node,
  isSelected,
  onNodeSelect,
  onConnectStart,
  onConnectEnd,
}: NodeElementProps) {
  const { handleNodeMouseDown, handleConnect } = useNode({
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
            onConnect={(e) => handleConnect(e, 'Top', i)}
          />
        )}
      />
      <NodeContext.Node
        className={isSelected ? 'is-dragging' : ''}
        onMouseDown={handleNodeMouseDown}
      >
        {node.type}
      </NodeContext.Node>
      <NodeContext.Connector onConnect={(e) => handleConnect(e, 'Bottom', 0)} />
    </NodeContext>
  )
})
