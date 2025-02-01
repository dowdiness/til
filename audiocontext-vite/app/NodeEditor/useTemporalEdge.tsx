import { useAtom } from 'jotai'
import { temporalEdgeAtom } from './temporalEdgeAtom'

export const useTemporalEdge = () => {
  const [temporalEdge, setTemporalEdge] = useAtom(temporalEdgeAtom)
  return [temporalEdge, setTemporalEdge] as const
}
