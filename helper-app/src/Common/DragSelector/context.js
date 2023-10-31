import { createContext, useContext } from 'react'

import { DRAG_MODE_REPLACE } from './constants'

export const DragContext = createContext({
  dragMode: DRAG_MODE_REPLACE,
  intersections: [],
  selecting: false
})

export function useDragContext () {
  return useContext(DragContext)
}
