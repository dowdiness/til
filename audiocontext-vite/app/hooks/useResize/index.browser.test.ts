import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { useResize } from '.'

const TestComponent = ({
  onResize,
  initialSize = { width: '100px', height: '100px' },
}: {
  onResize: (element: HTMLDivElement) => void
  initialSize?: { width: string; height: string }
}) => {
  const [divRef] = useResize<HTMLDivElement>(onResize)

  return React.createElement('div', {
    ref: divRef,
    'data-testid': 'resize-element',
    className: 'resize-test',
    style: {
      width: initialSize.width,
      height: initialSize.height,
      backgroundColor: 'red',
    },
  })
}

describe('useResize', () => {
  it('should call onResize when the element is mounted', async () => {
    const resizeHandler = vi.fn()
    render(React.createElement(TestComponent, { onResize: resizeHandler }))

    await vi.waitFor(() => {
      expect(resizeHandler).toHaveBeenCalledTimes(1)
    })
  })

  it('should call onResize when the element is resized', async () => {
    const resizeHandler = vi.fn()
    const screen = render(React.createElement(TestComponent, { onResize: resizeHandler }))

    await vi.waitFor(() => {
      expect(resizeHandler).toHaveBeenCalledTimes(1)
    })

    // Add a style tag to resize the element
    const style = document.createElement('style')
    style.textContent = '.resize-test { width: 200px !important; }'
    screen.container.appendChild(style)

    await vi.waitFor(() => {
      expect(resizeHandler).toHaveBeenCalledTimes(2)
    })
  })

  it('should handle multiple resize events', async () => {
    const resizeHandler = vi.fn()
    const screen = render(React.createElement(TestComponent, { onResize: resizeHandler }))

    await vi.waitFor(() => {
      expect(resizeHandler).toHaveBeenCalledTimes(1)
    })

    // Trigger multiple resize events
    const style = document.createElement('style')
    style.textContent = `
      .resize-test { width: 200px !important; }
    `
    screen.container.appendChild(style)

    const style2 = document.createElement('style')
    style2.textContent = `
      @media (min-width: 200px) {
        .resize-test { width: 300px !important; }
      }
    `
    screen.container.appendChild(style2)

    await vi.waitFor(() => {
      expect(resizeHandler.mock.calls.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('should handle height changes', async () => {
    const resizeHandler = vi.fn()
    const screen = render(React.createElement(TestComponent, { onResize: resizeHandler }))

    await vi.waitFor(() => {
      expect(resizeHandler).toHaveBeenCalledTimes(1)
    })

    // Change height
    const style = document.createElement('style')
    style.textContent = '.resize-test { height: 200px !important; }'
    screen.container.appendChild(style)

    await vi.waitFor(() => {
      expect(resizeHandler).toHaveBeenCalledTimes(2)
    })
  })

  it('should handle multiple elements using the hook simultaneously', async () => {
    const resizeHandler1 = vi.fn()
    const resizeHandler2 = vi.fn()

    const MultipleComponents = () => {
      return React.createElement('div', null, [
        React.createElement(TestComponent, { key: 1, onResize: resizeHandler1 }),
        React.createElement(TestComponent, { key: 2, onResize: resizeHandler2 }),
      ])
    }

    const { container } = render(React.createElement(MultipleComponents))

    await vi.waitFor(() => {
      expect(resizeHandler1).toHaveBeenCalledTimes(1)
      expect(resizeHandler2).toHaveBeenCalledTimes(1)
    })

    // Resize both elements
    const style = document.createElement('style')
    style.textContent = '.resize-test { width: 200px !important; }'
    container.appendChild(style)

    await vi.waitFor(() => {
      expect(resizeHandler1).toHaveBeenCalledTimes(2)
      expect(resizeHandler2).toHaveBeenCalledTimes(2)
    })
  })

  it('should handle zero dimensions', async () => {
    const resizeHandler = vi.fn()
    render(
      React.createElement(TestComponent, {
        onResize: resizeHandler,
        initialSize: { width: '0px', height: '0px' },
      }),
    )

    await vi.waitFor(() => {
      expect(resizeHandler).toHaveBeenCalledTimes(1)
      const element = resizeHandler.mock.calls[0][0]
      expect(element.offsetWidth).toBe(0)
      expect(element.offsetHeight).toBe(0)
    })
  })

  it('should handle visibility changes', async () => {
    const resizeHandler = vi.fn()
    const screen = render(React.createElement(TestComponent, { onResize: resizeHandler }))

    await vi.waitFor(() => {
      expect(resizeHandler).toHaveBeenCalledTimes(1)
    })

    const element = screen.getByTestId('resize-element').element() as HTMLDivElement
    // Hide the element
    element.style.display = 'none'

    await vi.waitFor(() => {
      expect(resizeHandler.mock.calls.length).toBe(2)
    })

    // Show the element again
    element.style.display = 'block'

    await vi.waitFor(() => {
      expect(resizeHandler.mock.calls.length).toBeGreaterThanOrEqual(3)
    })
  })

  it('should cleanup observer when component unmounts', async () => {
    const resizeHandler = vi.fn()
    const screen = render(React.createElement(TestComponent, { onResize: resizeHandler }))

    await vi.waitFor(() => {
      expect(resizeHandler).toHaveBeenCalledTimes(1)
    })

    // Unmount the component
    screen.unmount()

    // Add a style that would trigger resize if observer wasn't cleaned up
    const style = document.createElement('style')
    style.textContent = '.resize-test { width: 200px !important; }'
    screen.container.appendChild(style)

    await vi.waitFor(() => {
      // Should still only have the initial call
      expect(resizeHandler).toHaveBeenCalledTimes(1)
    })
  })
})
