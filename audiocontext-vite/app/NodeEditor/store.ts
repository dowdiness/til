import { LangNode, lib } from '@/CodeEditor/graph-language'
import { langProxy } from '@/CodeEditor/useLang'
import type { Position } from '@/NodeEditor/types'
import { mutableFilter } from '@/lib/mutable'
import { proxy, snapshot } from 'valtio'
import { devtools, watch } from 'valtio/utils'
import type { EdgeID, EdgeSnap, EdgeState, NodeID, NodeSnap, NodeState } from './types'

const n1: NodeID = `node-${crypto.randomUUID()}`
const n2: NodeID = `node-${crypto.randomUUID()}`
const add: NodeID = `node-${crypto.randomUUID()}`
const out: NodeID = `node-${crypto.randomUUID()}`

export const nodesProxy = proxy<NodeState[]>([
  {
    id: n1,
    type: 'n',
    args: [3],
    ins: [],
    position: { x: 100, y: 60 },
  },
  {
    id: n2,
    type: 'n',
    args: [5],
    ins: [],
    position: { x: 300, y: 60 },
  },
  {
    id: add,
    type: 'add',
    args: [],
    ins: [null, null],
    position: { x: 200, y: 150 },
  },
  {
    id: out,
    type: 'out',
    args: [],
    ins: [null],
    position: { x: 200, y: 250 },
  },
])

const edge1: EdgeID = `edge-${crypto.randomUUID()}`
const edge2: EdgeID = `edge-${crypto.randomUUID()}`
const edge3: EdgeID = `edge-${crypto.randomUUID()}`

export const edgesProxy = proxy<EdgeState[]>([
  {
    id: edge1,
    from: { x: 147, y: 117 },
    fromId: n1,
    to: { x: 230, y: 151 },
    toId: add,
    handlePosition: 0,
  },
  {
    id: edge2,
    from: { x: 349, y: 117 },
    fromId: n2,
    to: { x: 264, y: 151 },
    toId: add,
    handlePosition: 1,
  },
  {
    id: edge3,
    from: { x: 248, y: 217 },
    fromId: add,
    to: { x: 248, y: 250 },
    toId: out,
    handlePosition: 0,
  },
])

type AppState = {
  nodes: NodeState[]
  edges: EdgeState[]
  deleteNodeById: (id: NodeID) => void
  deleteEdgeById: (id: EdgeID) => void
  getNodeById: (id: NodeID) => NodeState | undefined
  updateNodeArgs: (id: NodeID, args: number[]) => void
  updateNodeIns: (toId: NodeID, fromId: NodeID, handlePosition: number) => void
  updateNodes: (selectedNode: NodeState, movement: Position) => void
  updateEdges: (selectedNode: NodeState, movement: Position) => void
}

export const editorProxy = proxy<AppState>({
  nodes: nodesProxy,
  edges: edgesProxy,
  deleteNodeById: (id) => {
    mutableFilter(nodesProxy, (node) => node.id !== id)
  },
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
  updateNodes: (selectedNode: NodeState, movement: Position) => {
    const { x, y } = movement
    for (let i = 0; i < nodesProxy.length; i++) {
      const node = nodesProxy[i]
      nodesProxy[i] =
        selectedNode.id === node.id
          ? {
              ...node,
              position: {
                x: node.position.x + x,
                y: node.position.y + y,
              },
            }
          : node
    }
  },
  updateEdges: (selectedNode: NodeState, movement: Position) => {
    const { x, y } = movement
    for (let i = 0; i < edgesProxy.length; i++) {
      const edge = edgesProxy[i]
      edgesProxy[i] =
        selectedNode.id === edge.fromId
          ? {
              ...edge,
              from: {
                x: edge.from.x + x,
                y: edge.from.y + y,
              },
            }
          : selectedNode.id === edge.toId
            ? {
                ...edge,
                to: {
                  x: edge.to.x + x,
                  y: edge.to.y + y,
                },
              }
            : edge
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
      // Convert numeric arguments, map null values onto 0
      const args = node.args.map((arg) => (arg === null ? 0 : arg))
      NodeMap.set(
        node.id,
        new LangNode(node.type, args, (_node, _ref, args) => {
          return `return ${args[0]}`
        }),
      )
    } else {
      // Convert numeric arguments, map null values onto 0
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
