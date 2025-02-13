import type { NewEdgeEnd, NewEdgeStart } from '@/NodeEditor/types'
import { useAtom } from 'jotai'
import { useCallback } from 'react'
import { temporalEdgeAtom } from './Edges/temporalEdgeAtom'
import { editorProxy } from './store'

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
        editorProxy.edges.push({ ...temporalEdge, ...edge })
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
