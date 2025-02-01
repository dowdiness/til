import { useSnapshot } from 'valtio'
import { nodesProxy } from '../store'
import type { NewEdgeEnd, NewEdgeStart, NodeID } from '../types'
import { BaseNode } from './BaseNode'
import { NumberNode } from './NumberNode'

type NodeContainerProps = React.ComponentProps<'div'> & {
  handleNodeSelect: (id: NodeID) => void
  handleConnectStart: (edge: NewEdgeStart) => void
  handleConnectEnd: (edge: NewEdgeEnd) => void
}

export function NodeContainer({
  handleNodeSelect,
  handleConnectStart,
  handleConnectEnd,
}: NodeContainerProps) {
  const nodes = useSnapshot(nodesProxy)
  return (
    <div>
      {nodes.map((node) => {
        switch (node.type) {
          case 'n':
            return (
              <NumberNode
                key={node.id}
                node={node}
                onNodeSelect={handleNodeSelect}
                onConnectStart={handleConnectStart}
                onConnectEnd={handleConnectEnd}
              />
            )
          default:
            return (
              <BaseNode
                key={node.id}
                node={node}
                onNodeSelect={handleNodeSelect}
                onConnectStart={handleConnectStart}
                onConnectEnd={handleConnectEnd}
              />
            )
        }
      })}
    </div>
  )
}
