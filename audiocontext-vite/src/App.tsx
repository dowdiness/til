import { proxy, useSnapshot, snapshot } from 'valtio'
import { subscribeKey } from 'valtio/utils'
import { Button } from './Button'
import { interpreter } from './graph-language'

const state = proxy({
  code: 'add(3, 2).mul(2).sub(3).div(2)',
  steps: '',
  result: '',
  error: '',
  isError() {
    return this.error.length > 0
  }
})

// type State = typeof state

const onCodechange = (code: string) => {
  try {
    const [steps, result] = interpreter.update(code)
    state.steps = steps
    state.result = `${result}`
    state.error = ''
  } catch (e) {
    if (e instanceof TypeError) {
      state.error = `TypeError: ${e.message}`
    } else if (e instanceof SyntaxError) {
      state.error = `SyntaxError: ${e.message}`
    } else if (e instanceof Error) {
      state.error = e.message
    }
    console.error(e)
  }
}

const unsubscribe = subscribeKey(state, 'code', () => {
    onCodechange(snapshot(state).code)
  }
)

function App() {
  const snap = useSnapshot(state)

  return (
    <main className='container mx-auto my-4 flex flex-col space-y-4 items-start'>
      <h1 className='text-3xl'>Graph Language</h1>
        <textarea
          id="program"
          name="program"
          value={snap.code}
          className='border p-2 w-64'
          onChange={(event) => state.code = event.target.value}
        ></textarea>
        <Button
          type="button"
          onClick={() => onCodechange(snapshot(state).code)}
        >
          Compile
        </Button>
        <code
          className={`
            ${state.isError()
              ? 'text-red-600 whitespace-pre-line'
              : 'whitespace-pre-line'
            }`
          }
        >
          {state.steps}
        </code>
        <p className={`${state.isError() ? 'text-red-600' : ''}`}>
          <span>Result: {state.result} </span><span></span>
        </p>
        <p className='text-red-600'>
          <span>{state.error} </span><span></span>
        </p>
    </main>
  )
}

export default App
