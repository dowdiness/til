import { useSnapshot } from 'valtio'
import { editorProxy } from '../store'
import { BaseEdge } from './BaseEdge'

export function EdgeContainer() {
  const snap = useSnapshot(editorProxy)

  return (
    <div>
      {snap.edges.map((edge) => (
        <BaseEdge key={edge.id} edge={edge} />
      ))}
    </div>
  )
}
