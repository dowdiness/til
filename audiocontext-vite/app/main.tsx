import { StrictMode, Profiler, type ProfilerOnRenderCallback } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import App from './App.tsx'

const isDev = false

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime,
) => {
  if (isDev) {
    console.log('Profiler ID:', id)
    console.log('Phase:', phase)
    console.log('Actual Duration:', actualDuration)
    console.log('Base Duration:', baseDuration)
    console.log('Start Time:', startTime)
    console.log('Commit Time:', commitTime)
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Profiler id="App" onRender={onRenderCallback}>
      <App />
    </Profiler>,
  </StrictMode>,
)
