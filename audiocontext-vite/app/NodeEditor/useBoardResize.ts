import { useResize } from '@/hooks/useResize'
import { editorProxy } from './store'

function handleResize<T extends Element>(element: T) {
  const { x, y } = element.getBoundingClientRect()
  editorProxy.boardRect = { x, y }
}

export function useBoardResize() {
  const [boardRef] = useResize<HTMLDivElement>(handleResize)
  return boardRef
}
