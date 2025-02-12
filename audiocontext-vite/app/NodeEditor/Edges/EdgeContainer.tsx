import { useSnapshot } from 'valtio'
import { editorProxy } from '../store'
import { BaseEdge } from './BaseEdge'

export function EdgeContainer() {
  const snap = useSnapshot(editorProxy)

  return (
    <div
      className="absolute inset-0 z-10 w-full h-full pointer-events-none"
      style={{ transformStyle: 'flat', willChange: 'transform' }}
    >
      {snap.edges.map((edge) => (
        <BaseEdge key={edge.id} edge={edge} />
      ))}
    </div>
  )
}
