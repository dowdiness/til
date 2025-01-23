import { proxy, ref } from 'valtio'
import type { NodeState, EdgeState, EdgeID } from './types'

type AppState = {
  nodes: NodeState[];
  edges: EdgeState[];
  isEditingNewEdge: boolean;
  selectedEdgeId: string;
  boardRect: DOMRectReadOnly;
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
  boardRect: ref(new DOMRectReadOnly()),
  deleteEdgeById(id) {
    this.edges = this.edges.filter(edge => edge.id !== id);
    this.selectedEdgeId = '';
  },
})
