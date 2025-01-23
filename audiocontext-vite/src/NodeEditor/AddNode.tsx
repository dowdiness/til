import { editorProxy } from './useEditor.ts'
import type { NodeTypes } from './types.ts'

export type AddNodeProps = {
  key: string,
  type: NodeTypes;
  args: (number | null)[];
  ins: (number | null)[];
}

// AddNode Component
export function AddNode({ type, args, ins }: AddNodeProps) {
  const handleClick = () => {
    editorProxy.nodes = [
      ...editorProxy.nodes,
      {
        id: `node-${crypto.randomUUID()}`,
        type,
        args,
        ins,
        position: { x: 10, y: 40 },
      },
    ]
  }

  return (
    <button
      className='px-2 border border-gray-400 rounded'
      onClick={handleClick}
    >
      {type}
    </button>
  )
}
