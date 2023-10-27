import { createContext, useCallback, useContext, useMemo } from 'react'
import { transformKeyPolygon } from 'keymap-layout-tools/lib/geometry.js'

import {
  DRAG_MODE_ADD,
  DRAG_MODE_REMOVE,
  DRAG_MODE_REPLACE,
  DragSelectContainer,
  useDragContext,
  useDragSelector
} from './DragSelector/DragSelector.jsx'
import Layout from './Layout.jsx'
import SelectableKey from './SelectableKey.jsx'

const DEFAULT_SCALE = 0.6

const SelectionContext = createContext({
  selection: [],
  previewSelection: [],
  previewDeselection: []
})

export default function SelectableLayout ({ layout, selection, onUpdate, onHover, scale = DEFAULT_SCALE, ...rest }) {
  const keyPolygons = useMemo(() => (
    layout.map(key => transformKeyPolygon(
      { x: key.x, y: key.y },
      { u: key.u || key.w || 1, h: key.h || 1 },
      { x: key.rx, y: key.ry, a: key.r }
    ).map(({ x, y }) => ({
      x: scale * x,
      y: scale * y
    })))
  ), [layout, scale])

  const handleDragSelect = useCallback(({ mode, intersections }) => {
    switch (mode) {
      case DRAG_MODE_ADD:
        return onUpdate([...selection, ...intersections])
      case DRAG_MODE_REMOVE:
        return onUpdate(selection.filter(index => !intersections.includes(index)))
      case DRAG_MODE_REPLACE:
      default:
        return onUpdate([...intersections])
    }
  }, [selection, onUpdate])

  const handleClickSelect = useCallback((event, index) => {
    event.preventDefault()
    event.stopPropagation()
    const isSelected = selection.includes(index)

    if (event.shiftKey) {
      onUpdate(
        isSelected
          ? selection.filter(i => i !== index)
          : [...selection, index]
      )
    } else {
      onUpdate(isSelected ? [] : [index])
    }
  }, [selection, onUpdate])

  const dragProps = useDragSelector(keyPolygons, handleDragSelect)

  return (
    <div style={{ position: 'relative', width: 'fit-content' }}>
      <DragSelectContainer {...dragProps}>
        <SelectionContextProvider selection={selection}>
          <Layout
            layout={layout}
            scale={scale}
            renderKey={({ index, keyLayout }) => (
              <SelectableKey
                index={index}
                keyLayout={keyLayout}
                onClick={event => handleClickSelect(event, index)}
                onMouseEnter={() => onHover(index)}
                onMouseLeave={() => onHover(null)}
              />
            )}
            {...rest}
          />
        </SelectionContextProvider>
      </DragSelectContainer>
    </div>
  )
}

export function useSelectionContext () {
  return useContext(SelectionContext)
}

function SelectionContextProvider ({ selection, children }) {
  const { dragMode, intersections } = useDragContext()
  const previewSelection = useMemo(() => {
    if (dragMode === DRAG_MODE_REMOVE) {
      return []
    }

    return intersections
  }, [dragMode, intersections])

  const previewDeselection = useMemo(() => {
    if (dragMode !== DRAG_MODE_REMOVE) {
      return []
    }

    return selection.filter(index => intersections.includes(index))
  }, [dragMode, selection, intersections])

  const context = {
    selection,
    previewSelection,
    previewDeselection
  }

  return (
    <SelectionContext.Provider value={context}>
      {children}
    </SelectionContext.Provider>
  )
}
