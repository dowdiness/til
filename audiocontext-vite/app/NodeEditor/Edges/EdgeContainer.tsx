import { edgesProxy } from '@/core'
import { useSnapshot } from 'valtio'
import { BaseEdge } from './BaseEdge'

export function EdgeContainer() {
  const edges = useSnapshot(edgesProxy)

  return (
    <div
      className="absolute inset-0 z-10 w-full h-full pointer-events-none"
      style={{ transformStyle: 'flat', willChange: 'transform' }}
    >
      {edges.map((edge) => (
        <BaseEdge key={edge.id} edge={edge} />
      ))}
    </div>
  )
}
