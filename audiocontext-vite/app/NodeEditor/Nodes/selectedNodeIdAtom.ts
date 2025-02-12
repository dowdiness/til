import type { NodeID } from '@/NodeEditor/types'
import { atom } from 'jotai'

export const selectedNodeIdAtom = atom<NodeID | null>(null)
