import { NodeContainer } from '@/NodeEditor/Nodes/NodeContainer'
import { EdgeContainer } from './Edges/EdgeContainer'
import { Panel } from './Panel'
import { useBoardResize } from './useBoardResize'
import { useNodeEditor } from './useNodeEditor'

export function Board() {
  const boardRef = useBoardResize()
  const {
    handleMouseDownBoard,
    handleMouseUpBoard,
    handleMouseMoveBoard,
    handleNodeSelect,
    handleConnectStart,
    handleConnectEnd,
    EdgeComp,
  } = useNodeEditor()

  return (
    <div
      ref={boardRef}
      className="relative block w-full h-full border border-zinc-400"
      onMouseDown={handleMouseDownBoard}
      onMouseUp={handleMouseUpBoard}
      onMouseMove={handleMouseMoveBoard}
    >
      <Panel />
      <EdgeContainer />
      <NodeContainer
        handleNodeSelect={handleNodeSelect}
        handleConnectStart={handleConnectStart}
        handleConnectEnd={handleConnectEnd}
      />
      {EdgeComp}
    </div>
  )
}
