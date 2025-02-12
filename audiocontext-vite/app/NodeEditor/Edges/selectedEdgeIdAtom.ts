import type { EdgeID } from '@/NodeEditor/types'
import { atom } from 'jotai'

export const selectedEdgeIdAtom = atom<EdgeID | null>(null)
