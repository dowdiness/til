import type { NodeID } from '@/NodeEditor/types'
import { atom } from 'jotai'
import { editorAtom } from '../store'
import type { Position } from '../types'

export const selectedNodeIdAtom = atom<NodeID | null>(null)

// Update objects position if selected node exists
export const updateNodeEditorPositionsAtom = atom<null, Position[], void>(
  null,
  (get, _, { x, y }) => {
    const selectedNodeId = get(selectedNodeIdAtom)
    const editor = get(editorAtom)
    if (selectedNodeId) {
      const selectedNode = editor.getNodeById(selectedNodeId)
      // Skip update if selected Node is not found
      if (!selectedNode) return
      // Update nodes position
      editor.updateNodes(selectedNode, { x: x, y: y })
      // Update edges position
      editor.updateEdges(selectedNode, { x: x, y: y })
    }
  },
)
