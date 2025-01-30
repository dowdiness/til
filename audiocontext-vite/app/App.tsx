import { Divider } from './Divider'
import { Board } from './NodeEditor/Board'
import { funcs } from './graph-language'
import { useLang } from './useLang'

function App() {
  const [snap, lang] = useLang()

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
      <textarea
        id="program"
        name="program"
        value={snap.code}
        className="w-full h-32 p-2 border sm:w-2/3"
        onChange={(event) => {
          lang.code = event.target.value
        }}
      />
      <code
        className={`
          ${snap.isError() ? 'text-red-600 whitespace-pre-line' : 'whitespace-pre-line'}`}
      >
        {snap.steps}
      </code>
      <p className={`${snap.isError() ? 'text-red-600' : ''}`}>
        <span>Result: {snap.result}: </span>
      </p>
      <p className="text-red-600">
        <span>{snap.error}: </span>
      </p>
    </main>
  )
}

export default App
