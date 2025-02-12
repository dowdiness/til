import type { NewEdgeEnd, NewEdgeStart, Position } from '@/NodeEditor/types'
import { useAtom } from 'jotai'
import { createElement, useCallback } from 'react'
import { BaseEdge } from './Edges/BaseEdge'
import { editorProxy } from './store'
import { temporalEdgeAtom } from './temporalEdgeAtom'
import { containerElement } from './useContainerRef'

export const useConnect = () => {
  const [temporalEdge, setTemporalEdge] = useAtom(temporalEdgeAtom)

  const handleUpdateTemporalEdgePosition = useCallback(
    ({ x, y }: Position) => {
      if (temporalEdge) {
        const containerRect = containerElement.getBoundingClientRect()
        setTemporalEdge({
          ...temporalEdge,
          to: {
            x: x - containerRect.x,
            y: y - containerRect.y,
          },
        })
      }
    },
    [temporalEdge, setTemporalEdge],
  )

  const handleConnectStart = useCallback(
    (edge: NewEdgeStart) => {
      console.log(edge)
      setTemporalEdge(edge)
    },
    [setTemporalEdge],
  )

  const handleConnectEnd = useCallback(
    (edge: NewEdgeEnd) => {
      if (temporalEdge) {
        editorProxy.edges.push({ ...temporalEdge, ...edge })
        setTemporalEdge(null)
      }
    },
    [temporalEdge, setTemporalEdge],
  )

  const EdgeComp = temporalEdge && createElement(BaseEdge, { edge: temporalEdge })
  console.log(EdgeComp)
  return {
    temporalEdge,
    setTemporalEdge,
    handleUpdateTemporalEdgePosition,
    handleConnectStart,
    handleConnectEnd,
    EdgeComp,
  } as const
}
