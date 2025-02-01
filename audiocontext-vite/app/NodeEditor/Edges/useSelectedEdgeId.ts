import type { EdgeID } from '@/NodeEditor/types'
import { atom, useAtom } from 'jotai'

export const selectedEdgeIdAtom = atom<EdgeID | null>(null)

export const useSelectedEdgeId = () => {
  const [selectedEdgeId, setSelectedEdgeId] = useAtom(selectedEdgeIdAtom)
  return [selectedEdgeId, setSelectedEdgeId] as const
}
