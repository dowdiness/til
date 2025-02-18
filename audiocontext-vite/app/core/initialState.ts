import type { EdgeID, EdgeState, NodeID, NodeState } from '@/NodeEditor/types'

const n1: NodeID = `node-${crypto.randomUUID()}`
const n2: NodeID = `node-${crypto.randomUUID()}`
const add: NodeID = `node-${crypto.randomUUID()}`
const out: NodeID = `node-${crypto.randomUUID()}`

// Initialize with default nodes
export const initialNodes: NodeState[] = [
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
]

const edge1: EdgeID = `edge-${crypto.randomUUID()}`
const edge2: EdgeID = `edge-${crypto.randomUUID()}`
const edge3: EdgeID = `edge-${crypto.randomUUID()}`

// Initialize with default edges
export const initialEdges: EdgeState[] = [
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
]
