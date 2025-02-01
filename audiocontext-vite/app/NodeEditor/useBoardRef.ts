export let boardElement: HTMLDivElement

export function useBoardRef() {
  const boardRef = (node: HTMLDivElement) => {
    boardElement = node
  }
  return boardRef
}
