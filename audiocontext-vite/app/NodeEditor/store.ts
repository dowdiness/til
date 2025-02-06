import { LangNode, lib } from '@/CodeEditor/graph-language'
import { langProxy } from '@/CodeEditor/useLang'
import { mutableFilter } from '@/lib/mutable'
import { proxy, snapshot } from 'valtio'
import { devtools, watch } from 'valtio/utils'
import type { EdgeID, EdgeSnap, EdgeState, NodeID, NodeSnap, NodeState } from './types'

export const nodesProxy = proxy<NodeState[]>([
  {
    id: `node-${crypto.randomUUID()}`,
    type: 'n',
    args: [3],
    ins: [],
    position: { x: 100, y: 60 },
  },
  {
    id: `node-${crypto.randomUUID()}`,
    type: 'n',
    args: [5],
    ins: [],
    position: { x: 300, y: 60 },
  },
  {
    id: `node-${crypto.randomUUID()}`,
    type: 'add',
    args: [],
    ins: [null, null],
    position: { x: 200, y: 150 },
  },
  {
    id: `node-${crypto.randomUUID()}`,
    type: 'out',
    args: [],
    ins: [null],
    position: { x: 200, y: 250 },
  },
])

export const edgesProxy = proxy<EdgeState[]>([])

type AppState = {
  nodes: NodeState[]
  edges: EdgeState[]
  deleteEdgeById: (id: EdgeID) => void
  getNodeById: (id: NodeID) => NodeState | undefined
  updateNodeArgs: (id: NodeID, args: number[]) => void
  updateNodeIns: (toId: NodeID, fromId: NodeID, handlePosition: number) => void
}

export const editorProxy = proxy<AppState>({
  nodes: nodesProxy,
  edges: edgesProxy,
  deleteEdgeById: (id) => {
    mutableFilter(edgesProxy, (edge) => edge.id !== id)
  },
  getNodeById: (id: NodeID) => {
    return nodesProxy.find((node) => node.id === id)
  },
  updateNodeArgs: (id: NodeID, args: number[]) => {
    const node = editorProxy.getNodeById(id)
    if (node) {
      node.args = args
    }
  },
  updateNodeIns: (toId: NodeID, fromId: NodeID, handlePosition: number) => {
    const node = editorProxy.getNodeById(toId)
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
  const [code, result] = convertNodes(nodes, edges)
  console.log(nodes, edges)
  console.log(code, result)
  langProxy.steps = code
  langProxy.result = result
})

function convertNodes(nodes: readonly NodeSnap[], edges: readonly EdgeSnap[]) {
  const NodeMap = new Map<NodeID, LangNode>()

  // Create LangNode based on node editor.
  for (const node of nodes) {
    if (node.type === 'out') {
      // Convert numeric arguments, map on null values to 0
      const args = node.args.map((arg) => (arg === null ? 0 : arg))
      NodeMap.set(
        node.id,
        new LangNode(node.type, args, (_node, _ref, args) => {
          return `return ${args[0]}`
        }),
      )
    } else {
      // Convert numeric arguments, map on null values to 0
      const args = node.args.map((arg) => (arg === null ? 0 : arg))
      NodeMap.set(node.id, new LangNode(node.type, args))
    }
  }

  // Add connected nodes based on edges information
  for (const edge of edges) {
    const from = nodes.find((node) => node.id === edge.fromId)
    const to = nodes.find((node) => node.id === edge.toId)
    if (from && to) {
      const toNode = NodeMap.get(to.id)
      const fromNode = NodeMap.get(from.id)
      if (fromNode && toNode) {
        // Ensure the ins array has enough capacity
        while (toNode.ins.length <= edge.handlePosition) {
          toNode.ins.push(0) // Use 0 as default value for unconnected inputs
        }
        toNode.ins[edge.handlePosition] = fromNode
      }
    }
  }

  let out: LangNode = new LangNode('out', [0], (_node, _ref, args) => {
    return `return ${args[0]}`
  })

  NodeMap.forEach((v, _k) => {
    if (v.type === 'out') {
      out = v
    }
  })

  const unit = out.compile()
  const code = unit.lines.join('\n')
  const fn = new Function('lib', code)
  const result = fn(lib) as string

  return [code, result] as const
}
