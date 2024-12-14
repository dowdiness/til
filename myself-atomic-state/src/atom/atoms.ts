import { useDebugValue, useEffect, useState } from 'react'

type atom<T> = {
  init: T,
}

type atomState<T> = {
  value: T,
  listeners: Set<() => void>,
}

type atomStateMap<T> = WeakMap<atom<T>, atomState<T>>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const atomStateMap: atomStateMap<any> = new WeakMap();

const getAtomState = <T>(atom: atom<T>) => {
  let atomState = atomStateMap.get(atom)
  if (!atomState) {
    atomState = { value: atom.init, listeners: new Set() }
    atomStateMap.set(atom, atomState)
  }
  return atomState
}

export const atom = <T>(initialValue: T) => ({ init: initialValue })

const useAtomValue = <T>(atom: atom<T>) => {
  const atomState = getAtomState(atom);
  const [value, setValue] = useState(atomState.value)

  useEffect(() => {
    const callback = () => setValue(atomState.value)
    atomState.listeners.add(callback)
    callback();
    return () => { atomState.listeners.delete(callback) };
  }, [atomState])

  useDebugValue(value)

  return value as T
}

const useSetAtom = <T>(atom: atom<T>) => {
  const atomState = getAtomState(atom);

  const setAtom = (nextValue: T) => {
    atomState.value = nextValue
    // nortify listeners to update related atoms
    atomState.listeners.forEach((l) => l())
  }

  return setAtom
}

export const useAtom = <T>(atom: atom<T>) => {
  return [useAtomValue(atom), useSetAtom(atom)] as const
}
