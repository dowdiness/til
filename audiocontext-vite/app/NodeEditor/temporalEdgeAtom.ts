import { atom } from 'jotai'
import type { NewEdgeStart } from './types'

export const temporalEdgeAtom = atom<NewEdgeStart | null>(null)
