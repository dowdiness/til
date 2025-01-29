import { proxy, snapshot, subscribe } from 'valtio'
import type { NodeState, EdgeState, EdgeID, Position } from './types'

type AppState = {
  nodes: NodeState[];
  edges: EdgeState[];
  isEditingNewEdge: boolean;
  selectedEdgeId: string;
  boardRect: Position;
  deleteEdgeById: (id: EdgeID) => void;
}

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
]);

export const edgesProxy = proxy<EdgeState[]>([])

export const editorProxy = proxy<AppState>({
  nodes: nodesProxy,
  edges: edgesProxy,
  isEditingNewEdge: false,
  selectedEdgeId: '',
  boardRect: { x: 0, y: 0 },
  deleteEdgeById(id) {
    this.edges = this.edges.filter(edge => edge.id !== id);
    this.selectedEdgeId = '';
  },
})

// subscribe(editorProxy, () => {
//   console.log(snapshot(editorProxy))
// })

subscribe(nodesProxy, () => {
  console.log('nodesProxy: ', snapshot(nodesProxy))
})

subscribe(edgesProxy, () => {
  console.log('edgesProxy: ', snapshot(edgesProxy))
})
