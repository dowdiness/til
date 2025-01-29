import { type FunctionNames } from '../graph-language'

type DeepReadonly<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>
}

export type NodeID = `node-${string}-${string}-${string}-${string}-${string}`
export type EdgeID = `edge-${string}-${string}-${string}-${string}-${string}`
export type Position =  { x: number, y: number }
export type NodeTypes = FunctionNames | 'n'
export type NodeState = {
  id: NodeID
  type: NodeTypes
  args: (number | null)[]
  ins: (number | null)[]
  position: Position
}
export type NodeSnap = DeepReadonly<NodeState>
export type NewEdgeStart = {
  id: EdgeID
  fromId: NodeID
  from: Position
  to: Position
}
export type NewEdgeEnd = {
  to: Position
  toId: NodeID
  handlePosition: number
}
export type EdgeState = NewEdgeStart & NewEdgeEnd
export type UsableEdgeStates = NewEdgeStart | EdgeState
