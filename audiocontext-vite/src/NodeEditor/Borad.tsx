import { useState } from 'react'
import { Panel } from './Panel'
import { BaseNode } from './BaseNode'
import { BaseEdge } from './BaseEdge'
import { editorProxy } from './useEditor'
import { useResize } from "../hooks/useResize"
import { useSnapshot, ref } from 'valtio'
import type { NewEdgeStart, NewEdgeEnd } from './types'

const handleResize = (entry: ResizeObserverEntry) => {
  editorProxy.boardRect = ref(entry.target.getBoundingClientRect())
}

export function Board() {
  const snap = useSnapshot(editorProxy)
  const [boardRef] = useResize(handleResize)
  console.log(boardRef)
  const [selectedNodeId, setSelectedNodeId] = useState<string|null>(null)
  const [newEdge, setNewEdge] = useState<NewEdgeStart|null>(null)

  function handleMouseDownBoard(_e: React.MouseEvent) {
    setNewEdge(null)
    editorProxy.isEditingNewEdge = false
  }

  function handleMouseUpBoard(_e: React.MouseEvent) {
    setSelectedNodeId(null)
  }

  function handleMouseMoveBoard(e: React.MouseEvent) {
    if (!!selectedNodeId) {
      const { nodes, edges } = editorProxy
      const selectedNode = nodes.find((node) => node.id === selectedNodeId)
      if (!selectedNode) return

      // Update nodes position.
      editorProxy.nodes = nodes.map((node) => {
        return selectedNode.id === node.id ? {
          ...node,
          position: {
            x: node.position.x + e.movementX,
            y: node.position.y + e.movementY,
          }
        } : node
      })

      // Update edges position.
      editorProxy.edges = edges.map((edge) => {
        return selectedNode.id === edge.fromId ? {
          ...edge,
          from: {
            x: edge.from.x + e.movementX,
            y: edge.from.y + e.movementY,
          }
        } : selectedNode.id === edge.toId ? {
          ...edge,
          to: {
            x: edge.to.x + e.movementX,
            y: edge.to.y + e.movementY,
          }
        } : edge
      })
    }

    if (newEdge) {
      const boardRect = editorProxy.boardRect
      setNewEdge({
        ...newEdge,
        to: {
          x: e.clientX - boardRect.x,
          y: e.clientY - boardRect.y,
        }
      })
    }
  }

  const handleNodeSelect = (id: string) => {
    setSelectedNodeId(id)
    setNewEdge(null)
    editorProxy.isEditingNewEdge = false
  }

  const handleConnectStart = (edge: NewEdgeStart) => {
    setNewEdge(edge)
    editorProxy.isEditingNewEdge = true
  }

  const handleConnectEnd = (edge: NewEdgeEnd) => {
    if (newEdge) {
      editorProxy.edges = [...snap.edges, { ...newEdge, ...edge }]
      setNewEdge(null)
      editorProxy.isEditingNewEdge = false
    }
  }

  return (
    <div
      ref={boardRef}
      className="relative block w-full h-full border border-gray-400"
      onMouseDown={handleMouseDownBoard}
      onMouseUp={handleMouseUpBoard}
      onMouseMove={handleMouseMoveBoard}
    >
      <Panel></Panel>
      {snap.edges.map(edge => (
        <BaseEdge
          key={edge.id}
          edge={edge}
          isSelected={edge.id === snap.selectedEdgeId}
        />
      ))}
      {snap.nodes.map(node => (
        <BaseNode
          key={node.id}
          node={node}
          onNodeSelect={handleNodeSelect}
          onConnectStart={handleConnectStart}
          onConnectEnd={handleConnectEnd}
        />
      ))}
      {newEdge && (
        <BaseEdge
          edge={newEdge}
          isSelected={false}
        />
      )}
    </div>
  );
}
