import { Divider } from './Divider'
import { functionNames } from './graph-language'
import { useLang } from './useLang'

function App() {
  const [snap, lang] = useLang()

  return (
    <main className='container flex flex-col items-start px-4 mx-auto my-4 space-y-4'>
      <h1 className='text-3xl'>Graph Language</h1>
      <Divider />
      <h2 className='text-xl'>Functions</h2>
      <ul className='flex space-x-2'>
        {functionNames.map((name) => {
          return <li key={name} className='px-2 border rounded'><span>{name}</span></li>
        })}
      </ul>
      <Divider />
      <textarea
        id="program"
        name="program"
        value={snap.code}
        className='w-full h-32 p-2 border sm:w-2/3'
        onChange={(event) => lang.code = event.target.value}
      ></textarea>
      <code
        className={`
          ${snap.isError()
            ? 'text-red-600 whitespace-pre-line'
            : 'whitespace-pre-line'
          }`
        }
      >
        {snap.steps}
      </code>
      <p className={`${snap.isError() ? 'text-red-600' : ''}`}>
        <span>Result: {snap.result} </span><span></span>
      </p>
      <p className='text-red-600'>
        <span>{snap.error} </span><span></span>
      </p>
    </main>
  )
}

export default App
