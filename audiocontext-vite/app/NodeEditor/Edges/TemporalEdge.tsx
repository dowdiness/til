import { useAtomValue } from 'jotai'
import { BaseEdge } from './BaseEdge'
import { temporalEdgeAtom } from './temporalEdgeAtom'

export function TemporalEdge() {
  const temporalEdge = useAtomValue(temporalEdgeAtom)
  if (!temporalEdge) return null
  return (
    <div
      className="absolute inset-0 z-0"
      style={{ transformStyle: 'flat', willChange: 'transform' }}
    >
      <BaseEdge edge={temporalEdge} />
    </div>
  )
}
