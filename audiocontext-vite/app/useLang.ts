import { useEffect } from 'react'
import { proxy, useSnapshot } from 'valtio'
import { subscribeKey } from 'valtio/utils'
import { interpreter } from './graph-language'

export type LangProxy = typeof langProxy
export type LangSnap = Readonly<LangProxy>
export type OnCodeChenge = (code: string) => void

const langProxy = proxy({
  code: 'add(3, 2).mul(2).sub(3).div(2)',
  steps: '',
  result: '',
  error: '',
  isError() {
    return this.error.length > 0
  }
})

export const compile = (code: string) => {
  try {
    const [steps, result] = interpreter.update(code)
    langProxy.steps = steps
    langProxy.result = `${result}`
    langProxy.error = ''
  } catch (e) {
    if (e instanceof TypeError) {
      langProxy.error = `TypeError: ${e.message}`
    } else if (e instanceof SyntaxError) {
      langProxy.error = `SyntaxError: ${e.message}`
    } else if (e instanceof Error) {
      langProxy.error = e.message
    }
  }
}

export const useLang = (
  onCodechange?: OnCodeChenge
): [LangSnap, LangProxy] => {
  const langSnap =  useSnapshot(langProxy, { sync: true })
  const handleCodeChange = (code: string) => {
    compile(code)
    if (onCodechange) {
      onCodechange(code)
    }
  }

  useEffect(() => {
    const unsubscribe = subscribeKey(langProxy, 'code', handleCodeChange)
    handleCodeChange(langSnap.code)
    return unsubscribe
  }, [])

  return [langSnap, langProxy]
}
