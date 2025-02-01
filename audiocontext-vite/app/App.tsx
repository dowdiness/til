import { CodeEditor } from '@/CodeEditor'
import { funcs } from '@/CodeEditor/graph-language'
import { Board } from '@/NodeEditor/Board'
import { Divider } from '@/components/ui/Divider'

function App() {
  return (
    <main className="container flex flex-col items-start my-8 space-y-4">
      <h1 className="text-3xl">Graph Language</h1>
      <Divider />
      <div className="w-full h-80">
        <Board />
      </div>
      <Divider />
      <h2 className="text-xl">Functions</h2>
      <ul className="flex space-x-2">
        {funcs.map(({ name, symbol }) => {
          return (
            <li key={name} className="px-2 py-1 border rounded">
              <span>
                {symbol} {name}
              </span>
            </li>
          )
        })}
      </ul>
      <Divider />
      <CodeEditor />
    </main>
  )
}

export default App
