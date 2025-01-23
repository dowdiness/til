import { useRef, useMemo, useSyncExternalStore } from 'react'

/**
 * Custom hook that provides a reference to a target HTML element and its bounding rectangle.
 * It uses the ResizeObserver API to observe changes in the size of the target element and
 * notifies subscribers when a resize occurs.
 *
 * @param {function} [onResize] - Optional callback function that is called when the target element is resized.
 * @returns {[React.RefObject<HTMLDivElement>, DOMRectReadOnly]} - A tuple containing a reference to the target element and its bounding rectangle.
 *
 * @example
 * const [targetRef, rect] = useResize((entry) => {
 *   console.log('Resized:', entry);
 * });
 *
 * return <div ref={targetRef}>Resize me!</div>;
 */
export function useResize(onResize?: (entry: ResizeObserverEntry) => void) {
  const targetRef = useRef<HTMLDivElement>(null!)

  const { subscribe, getSnapshot, getServerSnapshot } = useMemo(function() {
    let contentRect = new DOMRectReadOnly()
    const subscribers = new Set<() => void>()
    const resizeObserver = new ResizeObserver(([entry]) => {
      contentRect = entry.target.getBoundingClientRect()
      if (onResize) onResize(entry)
      subscribers.forEach((notifyResize) => notifyResize())
    })

    const subscribe = (onStoreChange: () => void) => {
      subscribers.add(onStoreChange)
      if (targetRef.current) {
        resizeObserver.observe(targetRef.current)
      }
      return () => {
        subscribers.delete(onStoreChange)
        if (targetRef.current) {
          resizeObserver.unobserve(targetRef.current)
        }
      }
    }

    const getSnapshot = () => {
      return contentRect
    }

    // Return mock object.
    const getServerSnapshot = () => {
      // DOMRectReadOnly is a browser-specific API and is not available in the server environment
      // because the server does not have access to the DOM.
      return {
        bottom: 0,
        height: 0,
        left: 0,
        right: 0,
        top: 0,
        width: 0,
        x: 0,
        y: 0,
        toJSON() {
          throw new Error('toJSON() is not implemented in the server environment')
        },
      }
    }
    return {
      subscribe,
      getSnapshot,
      getServerSnapshot,
    }
  }, [])


  const rect = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  )

  return [targetRef, rect] as const
}
