import { atom } from 'jotai'
import type { NewEdgeStart, Position } from '../types'
import { containerElement } from '../useContainerRef'

export const temporalEdgeAtom = atom<NewEdgeStart | null>(null)
export const updateTemporalEdgePositionAtom = atom<null, Position[], void>(
  null,
  (get, set, update) => {
    const temporalEdge = get(temporalEdgeAtom)
    if (temporalEdge) {
      const containerRect = containerElement.getBoundingClientRect()
      set(temporalEdgeAtom, {
        ...temporalEdge,
        to: {
          x: update.x - containerRect.x,
          y: update.y - containerRect.y,
        },
      })
    }
  },
)
