import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import create from 'zustand'

interface AppState {
  environmentID?: string
}

function storeFactory() {
  return create<AppState>(set => ({}))
}

type Store = ReturnType<typeof storeFactory>

const StoreContext = createContext<Store>(storeFactory())

export interface Props {
  initialState?: AppState
  onInit?: (store?: Store) => any
  onStateChange?: (state: AppState) => any
}

function StoreProvider({
  children,
  initialState,
  onInit,
  onStateChange,
}: PropsWithChildren<Props>) {
  const [store] = useState(storeFactory)

  useEffect(
    function handleOnInit() {
      onInit?.(store)
    },
    [store, onInit],
  )

  useEffect(
    function initializeStore() {
      if (!initialState) return
      store.setState(initialState, true)
    },
    [store, initialState],
  )

  useEffect(
    function handleStoreChange() {
      if (!onStateChange) return
      return store.subscribe(onStateChange)
    },
    [store, onStateChange],
  )

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useRootStore() {
  const store = useContext(StoreContext)
  if (!store) {
    throw new Error('Store cannot be null, please add a context provider')
  }
  return store
}

export default StoreProvider
