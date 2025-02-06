import { AddNode, type AddNodeProps } from './AddNode'

const nodeTypes = [
  {
    key: crypto.randomUUID(),
    type: 'n',
    args: [1],
    ins: [],
  },
  {
    key: crypto.randomUUID(),
    type: 'add',
    args: [null, null],
    ins: [null, null],
  },
  {
    key: crypto.randomUUID(),
    type: 'sub',
    args: [null, null],
    ins: [null, null],
  },
  {
    key: crypto.randomUUID(),
    type: 'mul',
    args: [null, null],
    ins: [null, null],
  },
  {
    key: crypto.randomUUID(),
    type: 'div',
    args: [null, null],
    ins: [null, null],
  },
  {
    key: crypto.randomUUID(),
    type: 'out',
    args: [null],
    ins: [null],
  },
] satisfies AddNodeProps[]

export function Panel() {
  return (
    <div className="absolute z-10 flex mx-4 my-2 space-x-2">
      {nodeTypes.map((nodeData) => {
        return (
          <AddNode
            key={nodeData.key}
            type={nodeData.type}
            args={nodeData.args}
            ins={nodeData.ins}
          />
        )
      })}
    </div>
  )
}
