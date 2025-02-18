import type { EdgeState, NodeState } from '@/NodeEditor/types'
import dagre from '@dagrejs/dagre'

const nodeWidth = 172
const nodeHeight = 36

export const getLayoutedElements = (
  nodes: NodeState[],
  edges: EdgeState[],
  direction = 'TB',
): { nodes: NodeState[]; edges: EdgeState[] } => {
  // Create a new graph for each layout calculation
  const dagreGraph = new dagre.graphlib.Graph()
    .setDefaultEdgeLabel(() => ({}))
    .setGraph({ rankdir: direction })

  // Add nodes to the graph
  for (const node of nodes) {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  }

  // Add edges to the graph
  for (const edge of edges) {
    dagreGraph.setEdge(edge.fromId, edge.toId)
  }

  // Calculate the layout
  dagre.layout(dagreGraph)

  // Get the positioned nodes
  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      // Convert dagre's center position to top-left position
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    }
  })

  // Update edge positions based on new node positions
  const newEdges = edges.map((edge) => {
    const fromNode = newNodes.find((n) => n.id === edge.fromId)
    const toNode = newNodes.find((n) => n.id === edge.toId)
    if (!fromNode || !toNode) return edge

    return {
      ...edge,
      from: {
        x: fromNode.position.x + nodeWidth / 2,
        y: fromNode.position.y + nodeHeight,
      },
      to: {
        x: toNode.position.x + nodeWidth / 2,
        y: toNode.position.y,
      },
    }
  })

  return { nodes: newNodes, edges: newEdges }
}
