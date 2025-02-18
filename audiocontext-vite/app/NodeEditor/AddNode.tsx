import { Button } from '@/components/ui/button'
import { nodesProxy } from '@/core'
import { useCallback } from 'react'
import type { NodeTypes } from './types.ts'

export type AddNodeProps = {
  key: string
  type: NodeTypes
  args: (number | null)[]
  ins: (number | null)[]
}

// AddNode Component
export function AddNode({ type, args, ins }: AddNodeProps) {
  const nonNullArgs = args.map((arg) => (arg === null ? 0 : arg))
  const handleClick = useCallback(() => {
    nodesProxy.push({
      id: `node-${crypto.randomUUID()}`,
      type,
      args: nonNullArgs,
      ins,
      position: { x: 10, y: 40 },
    })
  }, [type, nonNullArgs, ins])

  return (
    <Button size="sm" onClick={handleClick}>
      {type}
    </Button>
  )
}
