import type { EdgeState, NodeState } from '@/NodeEditor/types'
import { proxy } from 'valtio'
import { initialEdges, initialNodes } from './initialState'

// Shared state between NodeEditor and CodeEditor
export const langProxy = proxy({
  code: 'add(3, 2).mul(2).sub(3).div(2)',
  steps: '',
  result: '',
  error: '',
  isError() {
    return this.error.length > 0
  },
})

// Node editor state
export const nodesProxy = proxy<NodeState[]>(initialNodes)
export const edgesProxy = proxy<EdgeState[]>(initialEdges)

// Flags to prevent interrupting user input
export const updateFlags = {
  isEditingCode: false, // True while user is typing in code editor
  isEditingNodes: false, // True while user is modifying nodes
  isUpdatingFromCode: false, // True while system is updating nodes from code
  isUpdatingFromNode: false, // True while system is updating code from nodes
}
