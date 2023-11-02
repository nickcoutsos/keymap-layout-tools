import { useMemo } from 'react'
import { useSelectionContext, SelectionContext } from '../Common/SelectableLayout.jsx'
import { useReorderContext } from './Context.js'

export function ReorderSelectionContext ({ children }) {
  const { state, previewSelection: previewGroup } = useReorderContext()
  const selectionContext = useSelectionContext()

  const { previewSelection: basePreviewSelection } = selectionContext
  const groupSelection = previewGroup !== null
    ? state[previewGroup[0]][previewGroup[1]]
    : null

  const previewSelection = useMemo(() => ([
    ...basePreviewSelection,
    ...(groupSelection || [])
  ]), [basePreviewSelection, groupSelection])

  return (
    <SelectionContext.Provider value={{
      ...selectionContext,
      previewSelection
    }}>
      {children}
    </SelectionContext.Provider>
  )
}
