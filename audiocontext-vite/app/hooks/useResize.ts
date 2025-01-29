import { useCallback } from 'react'

/**
 * Custom hook that provides a resize observer for a given DOM element.
 *
 * @template T - The type of the DOM element to observe.
 * @param {function(T): void} [onResize] - callback function to be called when the element is resized.
 * @returns {readonly [(node: T) => () => void]} - A tuple containing a ref callback to be assigned to the element and the current DOM element.
 * @example
 * const [refCallback] = useResize<HTMLDivElement>((element) => {
 *   console.log('Resized:', element);
 * });
 *
 * return <div ref={refCallback}>Resize me!</div>;
 *
 * @see https://react.dev/learn/manipulating-the-dom-with-refs#how-to-manage-a-list-of-refs-using-a-ref-callback
 */
export function useResize<T extends Element>(
  onResize: (element: T) => void
) {
  const refCallback = useCallback((node: T) => {
    const resizeObserver = new ResizeObserver(() => {
      onResize(node)
    })
    resizeObserver.observe(node)
    onResize(node)
    return () => {
      resizeObserver.unobserve(node)
    }
  }, [onResize])

  return [refCallback] as const
}
