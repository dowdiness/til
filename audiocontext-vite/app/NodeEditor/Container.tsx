import { NodeContainer } from '@/NodeEditor/Nodes/NodeContainer'
import { EdgeContainer } from './Edges/EdgeContainer'
import { TemporalEdge } from './Edges/TemporalEdge'
import { Panel } from './Panel'
import { useContainerRef } from './useContainerRef'
import { useNodeEditor } from './useNodeEditor'

export function Container({ children }: React.ComponentProps<'article'>) {
  const containerRef = useContainerRef()
  const { handlePointerDownContainer, handlePointerUpContainer, handlePointerMoveContainer } =
    useNodeEditor()

  return (
    <article
      ref={containerRef}
      className="relative block w-full border h-80 border-zinc-400 touch-none"
      onPointerDown={handlePointerDownContainer}
      onPointerUp={handlePointerUpContainer}
      onPointerMove={handlePointerMoveContainer}
    >
      {children}
      <Panel />
      <EdgeContainer />
      <NodeContainer />
      <TemporalEdge />
    </article>
  )
}
