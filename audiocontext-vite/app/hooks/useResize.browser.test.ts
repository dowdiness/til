import { expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { useResize } from './useResize'
import React, { useEffect, useRef } from 'react'

const TestComponent = ({ onResize }: { onResize: (element: HTMLDivElement) => void }) => {
  const divRef = useRef<HTMLDivElement>(null)
  const [setRef] = useResize<HTMLDivElement>(onResize)

  useEffect(() => {
    if (divRef.current) {
      setRef(divRef.current)
    }
  }, [setRef])

  return React.createElement('div', {
    ref: divRef,
    'data-testid': 'resize-element',
    className: 'resize-test',
    style: { width: '100px', height: '100px' }
  })
}

test('should call onResize when the element is mounted', async () => {
  const resizeHandler = vi.fn()
  render(React.createElement(TestComponent, { onResize: resizeHandler }))

  // Wait for the element to be mounted and the initial resize callback
  await new Promise(resolve => setTimeout(resolve, 0))
  await expect(resizeHandler).toHaveBeenCalledTimes(1)
})

test('should call onResize when the element is resized', async () => {
  const resizeHandler = vi.fn()
  render(React.createElement(TestComponent, { onResize: resizeHandler }))

  // Wait for initial resize callback
  await new Promise(resolve => setTimeout(resolve, 0))
  await expect(resizeHandler).toHaveBeenCalledTimes(1)

  // Add a style tag to resize the element
  const style = document.createElement('style')
  style.textContent = '.resize-test { width: 200px !important; }'
  document.head.appendChild(style)

  // Wait for resize observer to trigger
  await new Promise(resolve => setTimeout(resolve, 100))

  await expect(resizeHandler).toHaveBeenCalledTimes(2) // Once for mount, once for resize
})
