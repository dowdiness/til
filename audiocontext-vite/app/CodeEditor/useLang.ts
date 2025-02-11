import { useEffect, useState } from 'react'
import { proxy, useSnapshot } from 'valtio'
import { subscribeKey } from 'valtio/utils'
import { Interpreter, interpreter } from './graph-language'

export type LangProxy = typeof langProxy
export type LangSnap = Readonly<LangProxy>
export type OnCodeChenge = (code: string) => void

export const langProxy = proxy({
  code: 'add(3, 2).mul(2).sub(3).div(2)',
  steps: '',
  result: '',
  error: '',
  isError() {
    return this.error.length > 0
  },
})

export const compile = (code: string) => {
  const [steps, result] = interpreter.compile(code)
  langProxy.steps = steps
  langProxy.result = `${result}`
  langProxy.error = interpreter.getState().errorMessage
}

export const step = (code: string) => {
  const interpreter = new Interpreter()
  interpreter.init(code)
  const handler = () => {
    const [steps, result] = interpreter.step()
    langProxy.steps = steps
    langProxy.result = `${result}`
    langProxy.error = interpreter.getState().errorMessage
  }
  return window.setInterval(handler, 2000)
}

export const useLang = (
  onCodechange?: OnCodeChenge,
): [LangSnap, LangProxy, boolean, React.Dispatch<React.SetStateAction<boolean>>] => {
  const [isStep, setIsStep] = useState(false)
  const langSnap = useSnapshot(langProxy, { sync: true })

  // Execute compiling when code is changed.
  useEffect(() => {
    let intervalID = 0
    const handleCodeChange = (code: string) => {
      if (isStep) {
        intervalID = step(code)
      } else {
        compile(code)
      }
      if (onCodechange) {
        onCodechange(code)
      }
    }

    const unsubscribe = subscribeKey(langProxy, 'code', handleCodeChange)
    handleCodeChange(langSnap.code)
    return () => {
      window.clearInterval(intervalID)
      unsubscribe()
    }
  }, [langSnap.code, isStep, onCodechange])

  return [langSnap, langProxy, isStep, setIsStep]
}
