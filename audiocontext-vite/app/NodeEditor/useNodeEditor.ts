import { useTemporalEdge } from '@/NodeEditor/useTemporalEdge'
import { createElement, useCallback } from 'react'
import { BaseEdge } from './Edges/BaseEdge'
import { useSelectedNodeId } from './Nodes/useSelectedNodeId'
import { editorProxy } from './store'
import type { NewEdgeEnd, NewEdgeStart } from './types'
import { boardElement } from './useBoardRef'

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

  const handlePointerDownBoard = useCallback(
    (e: React.PointerEvent) => {
      setTemporalEdge(null)
      if (e.target instanceof HTMLElement) {
        e.target.setPointerCapture(e.pointerId)
      }
    },
    [setTemporalEdge],
  )

  const handlePointerUpBoard = useCallback(
    (e: React.PointerEvent) => {
      setSelectedNodeId(null)
      if (e.target instanceof HTMLElement) {
        e.target.releasePointerCapture(e.pointerId)
      }
    },
    [setSelectedNodeId],
  )

  const handlePointerMoveBoard = useCallback(
    (e: React.PointerEvent) => {
      if (selectedNodeId) {
        const { nodes, edges } = editorProxy
        const selectedNode = nodes.find((node) => node.id === selectedNodeId)
        if (!selectedNode) return

        // Calculate movement based on pointer movement
        const movementX = e.movementX
        const movementY = e.movementY

        // Update nodes position
        nodes.forEach((node, i) => {
          nodes[i] =
            selectedNode.id === node.id
              ? {
                  ...node,
                  position: {
                    x: node.position.x + movementX,
                    y: node.position.y + movementY,
                  },
                }
              : node
        })

        // Update edges position
        edges.forEach((edge, i) => {
          edges[i] =
            selectedNode.id === edge.fromId
              ? {
                  ...edge,
                  from: {
                    x: edge.from.x + movementX,
                    y: edge.from.y + movementY,
                  },
                }
              : selectedNode.id === edge.toId
                ? {
                    ...edge,
                    to: {
                      x: edge.to.x + movementX,
                      y: edge.to.y + movementY,
                    },
                  }
                : edge
        })
      }

      if (temporalEdge) {
        const boardRect = boardElement.getBoundingClientRect()
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

  const EdgeComp = temporalEdge && createElement(BaseEdge, { edge: temporalEdge })

  return {
    hasTemporalEdge,
    handlePointerDownBoard,
    handlePointerUpBoard,
    handlePointerMoveBoard,
    handleConnectStart,
    handleConnectEnd,
    EdgeComp,
  }
}
