import { useSnapshot } from 'valtio'
import { BaseEdge } from './BaseEdge'
import { BaseNode } from './BaseNode'
import { NumberNode } from './NumberNode'
import { Panel } from './Panel'
import { editorProxy } from './store'
import { useBoardResize } from './useBoardResize'
import { useNodeEditor } from './useNodeEditor'

export function Board() {
  const snap = useSnapshot(editorProxy)
  const boardRef = useBoardResize()
  const {
    selectedNodeId,
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
      {snap.edges.map((edge) => (
        <BaseEdge key={edge.id} edge={edge} isSelected={edge.id === snap.selectedEdgeId} />
      ))}
      {snap.nodes.map((node) => {
        switch (node.type) {
          case 'n':
            return (
              <NumberNode
                key={node.id}
                node={node}
                isSelected={node.id === selectedNodeId}
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
                isSelected={node.id === selectedNodeId}
                onNodeSelect={handleNodeSelect}
                onConnectStart={handleConnectStart}
                onConnectEnd={handleConnectEnd}
              />
            )
        }
      })}
      {EdgeComp}
    </div>
  )
}
