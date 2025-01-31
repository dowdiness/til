import { Input } from '@/components/ui/input.tsx'
import { memo, useState } from 'react'
import type { NewEdgeEnd, NewEdgeStart, NodeSnap } from './types.ts'
import { editorProxy } from './useEditor.ts'
import { useNode } from './useNode.ts'

type NodeElementProps = {
  node: NodeSnap
  onNodeSelect: (id: string) => void
  onConnectStart: (edge: NewEdgeStart) => void
  onConnectEnd: (edge: NewEdgeEnd) => void
}

// NodeElement Component
export const NumberNode = memo(function BaseNode({
  node,
  onNodeSelect,
  onConnectStart,
  onConnectEnd,
}: NodeElementProps) {
  const [number, setNumber] = useState(node.args[0] ?? 10)
  const { handleNodeMouseDown, handleConnect } = useNode({
    node,
    onNodeSelect,
    onConnectStart,
    onConnectEnd,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumber(Number(e.target.value))
    editorProxy.updateNodeArgs(node.id, [Number(e.target.value)])
  }

  return (
    <div
      className="absolute"
      style={{ transform: `translate(${node.position.x}px, ${node.position.y}px)` }}
    >
      <div className="flex flex-col items-center" onMouseDown={handleNodeMouseDown}>
        <Input className="w-20" type="number" value={number} onChange={handleChange} />
        <div
          className="w-[10px] h-[10px] border rounded-md cursor-pointer border-card-foreground"
          onMouseDown={(e) => handleConnect(e, 'Bottom', 0)}
        />
      </div>
    </div>
  )
})
