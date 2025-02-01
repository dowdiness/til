import type { NodeSnap } from '@/NodeEditor/types'
import { useTemporalEdge } from '@/NodeEditor/useTemporalEdge'
import { cn } from '@/lib/utils'
import { createContext, useCallback, useContext } from 'react'

const InnerContext = createContext<NodeSnap>({
  id: `node-${crypto.randomUUID()}`,
  type: 'n',
  args: [20],
  ins: [],
  position: { x: 60, y: 30 },
})

type NodeContextProps = React.ComponentProps<'div'> & {
  node: NodeSnap
}

function NodeContext({ node, children, ...rest }: NodeContextProps) {
  return (
    <InnerContext value={node}>
      <div
        className="absolute flex flex-col items-center"
        style={{
          transform: `translate(${node.position.x}px, ${node.position.y}px)`,
        }}
        {...rest}
      >
        {children}
      </div>
    </InnerContext>
  )
}

type NodeConnectorProps = React.ComponentProps<'div'> & {
  onConnectStart: (e: React.MouseEvent) => void
  onConnectEnd: (e: React.MouseEvent) => void
}

function NodeConnector({ onConnectStart, onConnectEnd, ...rest }: NodeConnectorProps) {
  const [temporalEdge] = useTemporalEdge()
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (temporalEdge) {
        onConnectEnd(e)
      } else {
        onConnectStart(e)
      }
    },
    [onConnectEnd, onConnectStart, temporalEdge],
  )

  return (
    <div
      className="w-[10px] h-[10px] border rounded-md cursor-pointer border-card-foreground"
      onMouseDown={handleMouseDown}
      {...rest}
    />
  )
}

type NodeConnectorsProps = React.ComponentProps<'div'> & {
  connector: (i: number) => React.ReactNode
}

function NodeConnectors({ connector, ...rest }: NodeConnectorsProps) {
  const node = useContext(InnerContext)
  return (
    <div className="flex w-full justify-evenly" {...rest}>
      {node.ins.map((_, i) => connector(i))}
    </div>
  )
}

type NodeMainProps = React.ComponentProps<'div'> & {
  onMouseDown: (e: React.MouseEvent) => void
}
function NodeMain({ className, children, onMouseDown, ...rest }: NodeMainProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center w-24 h-12 px-8 py-4 text-base transition-colors bg-transparent border rounded-md shadow-sm cursor-pointer [&.is-dragging]:cursor-grabbing border-card-foreground active-visible:outline-none active-visible:ring-1 active-visible:ring-ring md:text-sm',
        className,
      )}
      onMouseDown={onMouseDown}
      {...rest}
    >
      {children}
    </div>
  )
}

NodeContext.Connector = NodeConnector
NodeContext.Connectors = NodeConnectors
NodeContext.Node = NodeMain

export { NodeContext, NodeConnector as Connector, NodeConnectors as Connectors, NodeMain as Node }
