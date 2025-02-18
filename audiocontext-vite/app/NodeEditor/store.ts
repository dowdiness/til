import { edgesProxy, langProxy, nodesProxy, updateFlags } from '@/core'
import { atomWithProxy } from 'jotai-valtio'
import { proxy } from 'valtio'
import { devtools, watch } from 'valtio/utils'
import { LangNode } from '../CodeEditor/graph-language'
import { mutableFilter } from '../lib/mutable'
import type { EdgeID, EdgeSnap, EdgeState, NodeID, NodeSnap, NodeState, Position } from './types'

type AppState = {
  deleteNodeById: (id: NodeID) => void
  deleteEdgeById: (id: EdgeID) => void
  getNodeById: (id: NodeID) => NodeState | undefined
  updateNodeArgs: (id: NodeID, args: number[]) => void
  updateNodeIns: (toId: NodeID, fromId: NodeID, handlePosition: number) => void
  updateNodes: (selectedNode: NodeState, movement: Position) => void
  updateEdges: (selectedNode: NodeState, movement: Position) => void
}

export const editorProxy = proxy<AppState>({
  deleteNodeById: (id) => {
    try {
      updateFlags.isEditingNodes = true
      mutableFilter(nodesProxy, (node: NodeState) => node.id !== id)
    } finally {
      updateFlags.isEditingNodes = false
    }
  },
  deleteEdgeById: (id) => {
    try {
      updateFlags.isEditingNodes = true
      mutableFilter(edgesProxy, (edge: EdgeState) => edge.id !== id)
    } finally {
      updateFlags.isEditingNodes = false
    }
  },
  getNodeById: (id: NodeID) => {
    return nodesProxy.find((node: NodeState) => node.id === id)
  },
  updateNodeArgs: (id: NodeID, args: number[]) => {
    try {
      updateFlags.isEditingNodes = true
      const node = editorProxy.getNodeById(id)
      if (node) {
        node.args = args
      }
    } finally {
      updateFlags.isEditingNodes = false
    }
  },
  updateNodeIns: (toId: NodeID, fromId: NodeID, handlePosition: number) => {
    try {
      updateFlags.isEditingNodes = true
      const node = editorProxy.getNodeById(toId)
      if (node) {
        node.ins[handlePosition] = fromId
      }
    } finally {
      updateFlags.isEditingNodes = false
    }
  },
  updateNodes: (selectedNode: NodeState, movement: Position) => {
    try {
      updateFlags.isEditingNodes = true
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
    } finally {
      updateFlags.isEditingNodes = false
    }
  },
  updateEdges: (selectedNode: NodeState, movement: Position) => {
    try {
      updateFlags.isEditingNodes = true
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
    } finally {
      updateFlags.isEditingNodes = false
    }
  },
})

// Function to convert nodes and edges to code
function convertNodes(nodes: NodeSnap[], edges: EdgeSnap[]): [string, string] {
  const NodeMap = new Map<NodeID, LangNode>()

  // Create LangNode based on node editor
  for (const node of nodes) {
    // Convert numeric arguments, map null values onto 0
    const args = node.args.map((arg) => (arg === null ? 0 : arg))
    NodeMap.set(node.id, new LangNode(node.type, args))
  }

  // Add connected nodes based on edges information
  for (const edge of edges) {
    const from = nodes.find((node: NodeSnap) => node.id === edge.fromId)
    const to = nodes.find((node: NodeSnap) => node.id === edge.toId)
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

  // Find the output node
  let outNode: LangNode | undefined
  for (const [nodeId, node] of NodeMap.entries()) {
    if (nodes.find((n) => n.id === nodeId)?.type === 'out') {
      outNode = node
      break
    }
  }

  // Only generate code if we have a proper node structure
  if (!outNode || !outNode.ins.length || outNode.ins.every((input) => typeof input === 'number')) {
    return ['', '0'] // Return empty code if no meaningful structure
  }

  // Compile the output node
  const { lines, last } = outNode.compile()
  const code = lines.join('\n')
  const fn = new Function('lib', `${code}\nreturn ${last}`)
  const result = fn({ n: (a: number) => a }) as string

  return [code, result]
}

// Watch for node/edge changes and update code
watch((get) => {
  if (!updateFlags.isUpdatingFromCode && !updateFlags.isEditingCode) {
    try {
      updateFlags.isUpdatingFromNode = true
      const nodes = get(nodesProxy)
      const edges = get(edgesProxy)
      const [code, result] = convertNodes(nodes, edges)

      // Only update code if we have meaningful code to show
      if (code) {
        langProxy.code = code
        langProxy.steps = code
        langProxy.result = result
      }
    } finally {
      updateFlags.isUpdatingFromNode = false
    }
  }
})

export const editorAtom = atomWithProxy(editorProxy)

devtools(editorProxy)
