import { Profiler, type ProfilerOnRenderCallback, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import App from './App.tsx'

const isDev = false

const onRenderCallback: ProfilerOnRenderCallback = (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
  if (isDev) {
    console.log('Profiler ID:', id)
    console.log('Phase:', phase)
    console.log('Actual Duration:', actualDuration)
    console.log('Base Duration:', baseDuration)
    console.log('Start Time:', startTime)
    console.log('Commit Time:', commitTime)
  }
}

const root = document.getElementById('root')

if (root) {
  createRoot(root).render(
    <StrictMode>
      <Profiler id="App" onRender={onRenderCallback}>
        <App />
      </Profiler>
      ,
    </StrictMode>,
  )
} else {
  throw new Error('Root element not found')
}
