import { Button } from '@/components/ui/button'
import { editorProxy } from './store.ts'
import type { NodeTypes } from './types.ts'

export type AddNodeProps = {
  key: string
  type: NodeTypes
  args: (number | null)[]
  ins: (number | null)[]
}

// AddNode Component
export function AddNode({ type, args, ins }: AddNodeProps) {
  const handleClick = () => {
    editorProxy.nodes.push({
      id: `node-${crypto.randomUUID()}`,
      type,
      args,
      ins,
      position: { x: 10, y: 40 },
    })
  }

  return (
    <Button size="sm" onClick={handleClick}>
      {type}
    </Button>
  )
}
