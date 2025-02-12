import { temporalEdgeAtom } from '@/NodeEditor/temporalEdgeAtom'
import type { NodeSnap } from '@/NodeEditor/types'
import { cn } from '@/lib/utils'
import { useAtomValue } from 'jotai'
import { createContext, useCallback, useContext } from 'react'

const defaultNode: NodeSnap = {
  id: `node-${crypto.randomUUID()}`,
  type: 'n',
  args: [20],
  ins: [],
  position: { x: 60, y: 30 },
}

const InnerContext = createContext<NodeSnap>(defaultNode)

type NodeContextProps = React.ComponentProps<'div'> & {
  node: NodeSnap
}

function NodeContext({ node, children, ...rest }: NodeContextProps) {
  return (
    <InnerContext value={node}>
      <div
        className="absolute flex flex-col items-center pointer-events-auto transform-3d will-change-transform"
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
  onConnectStart: (e: React.PointerEvent) => void
  onConnectEnd: (e: React.PointerEvent) => void
}

function NodeConnector({ onConnectStart, onConnectEnd, ...rest }: NodeConnectorProps) {
  const temporalEdge = useAtomValue(temporalEdgeAtom)
  const node = useContext(InnerContext)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation()
      if (e.target instanceof HTMLElement) {
        e.target.setPointerCapture(e.pointerId)
      }
      // If there's a temporal edge and this node is not the source node
      if (temporalEdge && temporalEdge.fromId !== node.id) {
        onConnectEnd(e)
      } else if (!temporalEdge) {
        // Only start a new connection if there's no temporal edge
        onConnectStart(e)
      }
    },
    [onConnectEnd, onConnectStart, temporalEdge, node.id],
  )

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.releasePointerCapture(e.pointerId)
    }
  }, [])

  return (
    <div
      className="w-[10px] h-[10px] border rounded-md cursor-pointer border-card-foreground touch-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
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
  onPointerDown: (e: React.PointerEvent) => void
}
function NodeMain({ className, children, onPointerDown, ...rest }: NodeMainProps) {
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.target instanceof HTMLElement) {
        e.target.setPointerCapture(e.pointerId)
      }
      onPointerDown(e)
    },
    [onPointerDown],
  )

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.releasePointerCapture(e.pointerId)
    }
  }, [])

  return (
    <div
      className={cn(
        'flex items-center justify-center w-24 h-12 px-8 py-4 text-base transition-colors bg-transparent border rounded-md shadow-sm cursor-pointer [&.is-dragging]:cursor-grabbing border-card-foreground active-visible:outline-none active-visible:ring-1 active-visible:ring-ring md:text-sm',
        'touch-none',
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
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
