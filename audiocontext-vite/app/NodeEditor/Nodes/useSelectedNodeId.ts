import type { NodeID } from '@/NodeEditor/types'
import { atom, useAtom } from 'jotai'

export const selectedNodeIdAtom = atom<NodeID | null>(null)

export const useSelectedNodeId = () => {
  const [selectedNodeId, setSelectedNodeId] = useAtom(selectedNodeIdAtom)
  return [selectedNodeId, setSelectedNodeId] as const
}
