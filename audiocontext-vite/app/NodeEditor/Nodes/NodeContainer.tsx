import { useSnapshot } from 'valtio'
import { nodesProxy } from '../store'
import type { NewEdgeEnd, NewEdgeStart, NodeID } from '../types'
import { BaseNode } from './BaseNode'
import { NumberNode } from './NumberNode'
import { OutNode } from './OutNode'

type NodeContainerProps = React.ComponentProps<'div'> & {
  onNodeSelect?: (id: NodeID) => void
  onConnectStart: (edge: NewEdgeStart) => void
  onConnectEnd: (edge: NewEdgeEnd) => void
}

export function NodeContainer({ onNodeSelect, onConnectStart, onConnectEnd }: NodeContainerProps) {
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
                onNodeSelect={onNodeSelect}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
              />
            )
          case 'out':
            return (
              <OutNode
                key={node.id}
                node={node}
                onNodeSelect={onNodeSelect}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
              />
            )
          default:
            return (
              <BaseNode
                key={node.id}
                node={node}
                onNodeSelect={onNodeSelect}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
              />
            )
        }
      })}
    </div>
  )
}
