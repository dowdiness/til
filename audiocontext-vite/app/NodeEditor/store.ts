import { mutableFilter } from '@/lib/mutable'
import { proxy, snapshot } from 'valtio'
import { devtools, watch } from 'valtio/utils'
import type { EdgeID, EdgeState, NodeID, NodeState } from './types'

export const nodesProxy = proxy<NodeState[]>([
  {
    id: `node-${crypto.randomUUID()}`,
    type: 'add',
    args: [],
    ins: [null, null],
    position: { x: 20, y: 200 },
  },
  {
    id: `node-${crypto.randomUUID()}`,
    type: 'sub',
    args: [],
    ins: [null, null],
    position: { x: 200, y: 100 },
  },
])

export const edgesProxy = proxy<EdgeState[]>([])

type AppState = {
  nodes: NodeState[]
  edges: EdgeState[]
  deleteEdgeById: (id: EdgeID) => void
  getNodeById: (id: string) => NodeState | undefined
  updateNodeArgs: (id: string, args: (number | null)[]) => void
  updateNodeIns: (id: string, fromId: NodeID, handlePosition: number) => void
}

export const editorProxy = proxy<AppState>({
  nodes: nodesProxy,
  edges: edgesProxy,
  deleteEdgeById(id) {
    mutableFilter(this.edges, (edge) => edge.id !== id)
  },
  getNodeById(id: string) {
    return this.nodes.find((node) => node.id === id)
  },
  updateNodeArgs(id: string, args: (number | null)[]) {
    const node = this.getNodeById(id)
    if (node) {
      node.args = args
    }
  },
  updateNodeIns(id: string, fromId: NodeID, handlePosition: number) {
    const node = this.getNodeById(id)
    if (node) {
      node.ins[handlePosition] = fromId
    }
  },
})

devtools(editorProxy)
// subscribe(editorProxy, () => {
//   console.log(snapshot(editorProxy))
// })

// subscribe(nodesProxy, () => {
//   console.log('nodesProxy: ', snapshot(nodesProxy))
// })

// subscribe(edgesProxy, () => {
//   console.log('edgesProxy: ', snapshot(edgesProxy))
// })
watch((get) => {
  const nodes = snapshot(get(nodesProxy))
  const edges = snapshot(get(edgesProxy))
  console.log(nodes, edges)
})
