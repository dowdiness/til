import type { NewEdgeEnd, NewEdgeStart } from '@/NodeEditor/types'
import { edgesProxy } from '@/core'
import { useAtom } from 'jotai'
import { useCallback } from 'react'
import { temporalEdgeAtom } from './Edges/temporalEdgeAtom'

export const useConnect = () => {
  const [temporalEdge, setTemporalEdge] = useAtom(temporalEdgeAtom)

  const handleConnectStart = useCallback(
    (edge: NewEdgeStart) => {
      setTemporalEdge(edge)
    },
    [setTemporalEdge],
  )

  const handleConnectEnd = useCallback(
    (edge: NewEdgeEnd) => {
      if (temporalEdge) {
        edgesProxy.push({ ...temporalEdge, ...edge })
        setTemporalEdge(null)
      }
    },
    [temporalEdge, setTemporalEdge],
  )

  return {
    handleConnectStart,
    handleConnectEnd,
  } as const
}
