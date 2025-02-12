import { NodeContainer } from '@/NodeEditor/Nodes/NodeContainer'
import { EdgeContainer } from './Edges/EdgeContainer'
import { Panel } from './Panel'
import { useBoardRef } from './useBoardRef'
import { useNodeEditor } from './useNodeEditor'

export function Board() {
  const boardRef = useBoardRef()
  const {
    handlePointerDownBoard,
    handlePointerUpBoard,
    handlePointerMoveBoard,
    handleConnectStart,
    handleConnectEnd,
    EdgeComp,
  } = useNodeEditor()

  return (
    <article
      ref={boardRef}
      className="relative block w-full border h-80 border-zinc-400 touch-none"
      onPointerDown={handlePointerDownBoard}
      onPointerUp={handlePointerUpBoard}
      onPointerMove={handlePointerMoveBoard}
    >
      <Panel />
      <EdgeContainer />
      <NodeContainer onConnectStart={handleConnectStart} onConnectEnd={handleConnectEnd} />
      {EdgeComp}
    </article>
  )
}
