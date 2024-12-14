import { atom, useAtom } from './atom/atoms'

const countAtom = atom<number>(0)

export const Count = () => {
  const [count, setCount] = useAtom<number>(countAtom)

  return (
    <button onClick={() => setCount(count + 1)}>
      count is {count}
    </button>
  )
}
