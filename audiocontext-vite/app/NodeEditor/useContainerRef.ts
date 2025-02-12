export let containerElement = document.createElement('div')

export function useContainerRef() {
  // TODO return cleanup function
  const containerRef = (node: HTMLDivElement) => {
    containerElement = node
  }
  return containerRef
}
