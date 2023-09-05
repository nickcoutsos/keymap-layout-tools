import { createContext, useContext } from 'react'

export const ReorderContext = createContext({})

export function useReorderContext () {
  return useContext(ReorderContext)
}
