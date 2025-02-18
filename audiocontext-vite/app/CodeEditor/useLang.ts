import type { EdgeState, NodeID, NodeState } from '@/NodeEditor/types'
import { edgesProxy, langProxy, nodesProxy, updateFlags } from '@/core'
import { getLayoutedElements } from '@/lib/layout'
import { useCallback, useEffect, useState } from 'react'
import { useSnapshot } from 'valtio'
import { subscribeKey } from 'valtio/utils'
import { Interpreter, LangNode, interpreter } from './graph-language'

export type LangSnap = Readonly<typeof langProxy>
export type OnCodeChenge = (code: string) => void

const convertLangNodeToNodeState = (node: LangNode): NodeState => {
  const nodeId = `node-${crypto.randomUUID()}` as NodeID
  return {
    id: nodeId,
    type: node.type,
    args: node.ins.map((input) => (typeof input === 'number' ? input : 0)),
    ins: [], // Will be populated after all nodes are created
    position: { x: 0, y: 0 }, // Position will be set by dagre
  }
}

const createEdgeState = (
  fromNode: NodeState,
  toNode: NodeState,
  handlePosition: number,
): EdgeState => {
  return {
    id: `edge-${crypto.randomUUID()}`,
    from: { x: 0, y: 0 }, // Position will be set by dagre
    fromId: fromNode.id,
    to: { x: 0, y: 0 }, // Position will be set by dagre
    toId: toNode.id,
    handlePosition,
  }
}

export const compile = (code: string): void => {
  if (!code.trim()) return

  const [steps, result] = interpreter.compile(code)
  langProxy.steps = steps
  langProxy.result = `${result}`
  langProxy.error = interpreter.getState().errorMessage
}

export const step = (code: string): number => {
  if (!code.trim()) return 0

  const interpreter = new Interpreter()
  interpreter.init(code)
  const handler = () => {
    const [steps, result] = interpreter.step()
    langProxy.steps = steps
    langProxy.result = `${result}`
    langProxy.error = interpreter.getState().errorMessage
  }
  return window.setInterval(handler, 2000)
}

export const useLang = (
  onCodechange?: OnCodeChenge,
): [LangSnap, typeof langProxy, boolean, React.Dispatch<React.SetStateAction<boolean>>] => {
  const [isStep, setIsStep] = useState(false)
  const langSnap = useSnapshot(langProxy, { sync: true })

  const updateNodesFromCode = useCallback((code: string) => {
    if (!code.trim() || langProxy.isError()) return

    try {
      updateFlags.isUpdatingFromCode = true
      const rootNode = interpreter.createNode(code)
      const sortedNodes = rootNode.getSortedNodes()

      // Clear existing nodes and edges
      nodesProxy.length = 0
      edgesProxy.length = 0

      // Create initial nodes and edges without positions
      const nodeMap = new Map<LangNode, NodeState>()
      const initialNodes: NodeState[] = []
      const initialEdges: EdgeState[] = []

      // Create nodes first
      for (const node of sortedNodes) {
        const nodeState = convertLangNodeToNodeState(node)
        nodeMap.set(node, nodeState)
        initialNodes.push(nodeState)
      }

      // Create edges and update node inputs
      for (const [node, nodeState] of nodeMap.entries()) {
        const inputs: (NodeID | null)[] = []
        for (const [index, input] of node.ins.entries()) {
          if (input instanceof LangNode) {
            const fromNodeState = nodeMap.get(input)
            if (fromNodeState) {
              inputs[index] = fromNodeState.id
              initialEdges.push(createEdgeState(fromNodeState, nodeState, index))
            }
          } else {
            inputs[index] = null
          }
        }
        nodeState.ins = inputs
      }

      // Apply dagre layout
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes,
        initialEdges,
        'TB', // Top to Bottom direction
      )

      // Update the proxies with layouted elements
      for (const node of layoutedNodes) {
        nodesProxy.push(node)
      }
      for (const edge of layoutedEdges) {
        edgesProxy.push(edge)
      }
    } catch (error) {
      // Ignore errors during code parsing
      console.error('Error parsing code:', error)
    } finally {
      updateFlags.isUpdatingFromCode = false
    }
  }, [])

  // Execute compiling when code is changed
  useEffect(() => {
    let intervalID = 0
    let lastUserCode = langSnap.code

    const handleCodeChange = (code: string) => {
      if (!code.trim()) return

      if (isStep) {
        intervalID = step(code)
      } else {
        compile(code)
      }
      if (onCodechange) {
        onCodechange(code)
      }
      // Only update nodes if we're not currently editing nodes
      if (!updateFlags.isEditingNodes) {
        updateNodesFromCode(code)
      }
    }

    const unsubscribe = subscribeKey(langProxy, 'code', (code) => {
      // Skip if this is a user edit
      if (updateFlags.isEditingCode) {
        lastUserCode = code
        return
      }

      // Skip if code hasn't actually changed (prevents loops)
      if (code === lastUserCode) return

      handleCodeChange(code)
    })

    // Initial code compilation if not empty and not editing
    if (langSnap.code.trim() && !updateFlags.isEditingCode && !updateFlags.isEditingNodes) {
      handleCodeChange(langSnap.code)
    }

    return () => {
      window.clearInterval(intervalID)
      unsubscribe()
    }
  }, [langSnap.code, isStep, onCodechange, updateNodesFromCode])

  return [langSnap, langProxy, isStep, setIsStep]
}
