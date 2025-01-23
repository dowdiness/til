import { useState, useCallback } from 'react'

/**
 * Custom hook that provides a resize observer for a given DOM element.
 *
 * @template T - The type of the DOM element to observe.
 * @param {function(ResizeObserverEntry): void} [onResize] - Optional callback function to be called when the element is resized.
 * @returns {readonly [(node: T) => () => void, DOMRectReadOnly]} - A tuple containing a ref callback to be assigned to the element and the current DOMRectReadOnly of the element.
 * @example
 * const [refCallback, rect] = useResize<HTMLDivElement>((entry) => {
 *   console.log('Resized:', entry);
 * });
 *
 * return <div ref={refCallback}>Resize me!</div>;
 *
 * @see https://react.dev/learn/manipulating-the-dom-with-refs#how-to-manage-a-list-of-refs-using-a-ref-callback
 */
export function useResize<T extends Element>(
  onResize?: (entry: ResizeObserverEntry) => void
): readonly [(node: T) => () => void, DOMRectReadOnly] {
  const [rect, setRect] = useState(() => new DOMRectReadOnly())

  const refCallback = useCallback((node: T) => {
    const resizeObserver = new ResizeObserver(([entry]) => {
      setRect(node.getBoundingClientRect())
      if (onResize) onResize(entry)
    })
    resizeObserver.observe(node)

    return () => {
      resizeObserver.unobserve(node)
    }
  }, [onResize])

  return [refCallback, rect] as const
}
