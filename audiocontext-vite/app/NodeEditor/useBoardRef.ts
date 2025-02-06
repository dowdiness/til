export let boardElement = document.createElement('div')

export function useBoardRef() {
  const boardRef = (node: HTMLDivElement) => {
    boardElement = node
  }
  return boardRef
}
