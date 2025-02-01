import { useTemporalEdge } from '@/NodeEditor/useTemporalEdge'
import { createElement, useCallback } from 'react'
import { BaseEdge } from './Edges/BaseEdge'
import { useSelectedNodeId } from './Nodes/useSelectedNodeId'
import { editorProxy } from './store'
import type { NewEdgeEnd, NewEdgeStart, NodeID } from './types'

export const useNodeEditor = () => {
  const [selectedNodeId, setSelectedNodeId] = useSelectedNodeId()
  const [temporalEdge, setTemporalEdge] = useTemporalEdge()
  const hasTemporalEdge = temporalEdge !== null

  const handleConnectStart = useCallback(
    (edge: NewEdgeStart) => {
      setTemporalEdge(edge)
    },
    [setTemporalEdge],
  )

  const handleConnectEnd = useCallback(
    (edge: NewEdgeEnd) => {
      if (temporalEdge) {
        editorProxy.edges.push({ ...temporalEdge, ...edge })
        setTemporalEdge(null)
      }
    },
    [temporalEdge, setTemporalEdge],
  )

  const handleMouseDownBoard = useCallback(
    (_e: React.MouseEvent) => {
      setTemporalEdge(null)
    },
    [setTemporalEdge],
  )

  const handleMouseUpBoard = useCallback(
    (_e: React.MouseEvent) => {
      setSelectedNodeId(null)
    },
    [setSelectedNodeId],
  )

  const handleMouseMoveBoard = useCallback(
    (e: React.MouseEvent) => {
      if (selectedNodeId) {
        const { nodes, edges } = editorProxy
        const selectedNode = nodes.find((node) => node.id === selectedNodeId)
        if (!selectedNode) return

        // Update nodes position.
        // FIXME Maybe we should not update every element in array...
        nodes.forEach((node, i) => {
          nodes[i] =
            selectedNode.id === node.id
              ? {
                  ...node,
                  position: {
                    x: node.position.x + e.movementX,
                    y: node.position.y + e.movementY,
                  },
                }
              : node
        })

        // Update edges position.
        // FIXME Maybe we should not update every element in array...
        edges.forEach((edge, i) => {
          edges[i] =
            selectedNode.id === edge.fromId
              ? {
                  ...edge,
                  from: {
                    x: edge.from.x + e.movementX,
                    y: edge.from.y + e.movementY,
                  },
                }
              : selectedNode.id === edge.toId
                ? {
                    ...edge,
                    to: {
                      x: edge.to.x + e.movementX,
                      y: edge.to.y + e.movementY,
                    },
                  }
                : edge
        })
      }

      if (temporalEdge) {
        const boardRect = editorProxy.boardRect
        setTemporalEdge({
          ...temporalEdge,
          to: {
            x: e.clientX - boardRect.x,
            y: e.clientY - boardRect.y,
          },
        })
      }
    },
    [selectedNodeId, temporalEdge, setTemporalEdge],
  )

  const handleNodeSelect = useCallback(
    (id: NodeID) => {
      setSelectedNodeId(id)
      setTemporalEdge(null)
    },
    [setSelectedNodeId, setTemporalEdge],
  )

  const EdgeComp = temporalEdge && createElement(BaseEdge, { edge: temporalEdge })

  return {
    hasTemporalEdge,
    handleMouseDownBoard,
    handleMouseUpBoard,
    handleMouseMoveBoard,
    handleNodeSelect,
    handleConnectStart,
    handleConnectEnd,
    EdgeComp,
  }
}
