import {
  useCallback,
  useEffect,
  useMemo,
  useReducer
} from 'react'

import {
  bbox,
  bboxUnion
} from 'keymap-layout-tools/lib/geometry'

import {
  DRAG_MODE_ADD,
  DRAG_MODE_REMOVE,
  DRAG_MODE_REPLACE,
  DRAG_STYLE_BOX
} from './constants.js'

import {
  createInitialState,
  reducer
} from './reducer.js'

import {
  getRelativeAncestor,
  getIntersectingPolygons,
  getIntersectingPolygonsTrail
} from './util'

export function useDragSelector (polygons, onSelect) {
  const [state, actions] = useDragStateReducer()
  const {
    style,
    mode,
    start,
    rect,
    trail
  } = state

  const {
    setStyle,
    beginDrag,
    endDrag,
    drag
  } = actions

  const selecting = useMemo(() => rect && (
    Math.abs(rect[0][0] - rect[1][0]) > 3 ||
    Math.abs(rect[0][1] - rect[1][1]) > 3
  ), [rect])

  const boundingBox = useMemo(() => {
    return polygons.map(bbox).reduce(bboxUnion)
  }, [polygons])

  const intersections = useMemo(() => {
    if (!selecting) {
      return []
    }

    return style === DRAG_STYLE_BOX
      ? getIntersectingPolygons(rect, polygons)
      : getIntersectingPolygonsTrail(trail, polygons)
  }, [polygons, selecting, style, rect, trail])

  const handleChangeStyle = useCallback(style => (
    setStyle(style)
  ), [setStyle])

  const handleMouseDown = useCallback(event => {
    const offsetElement = getRelativeAncestor(event.target)
    const rect = offsetElement.getBoundingClientRect()
    const { clientX: x, clientY: y } = event

    const focussedElement = document.querySelector(':focus')
    if (focussedElement) {
      focussedElement.blur()
    }

    event.preventDefault()
    beginDrag([x, y], rect)
  }, [beginDrag])

  const handleMouseMove = useCallback(event => {
    if (start) {
      drag(event.clientX, event.clientY, getDragModeFromEvent(event))
    }
  }, [start, drag])

  const handleMouseUp = useCallback(event => {
    if (!start) {
      return
    }

    if (selecting) {
      onSelect({ mode, intersections })
    }

    endDrag()
  }, [onSelect, intersections, mode, start, selecting, endDrag])

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [handleMouseUp, handleMouseMove])

  return {
    ...state,
    ...actions,
    boundingBox,
    selecting,
    intersections,
    onMouseDown: handleMouseDown,
    onChangeStyle: handleChangeStyle
  }
}

function getDragModeFromEvent (event) {
  if (event.shiftKey) {
    return DRAG_MODE_ADD
  } else if (event.altKey) {
    return DRAG_MODE_REMOVE
  }

  return DRAG_MODE_REPLACE
}

function useDragStateReducer () {
  const [state, dispatch] = useReducer(reducer, null, createInitialState)

  const setStyle = useCallback(style => dispatch({ type: 'set_style', style }), [dispatch])
  const beginDrag = useCallback((startPoint, offsetRect) => dispatch({ type: 'begin', startPoint, offsetRect }), [dispatch])
  const endDrag = useCallback(() => dispatch({ type: 'end' }), [dispatch])
  const drag = useCallback((clientX, clientY, mode) => dispatch({ type: 'drag', clientX, clientY, mode }), [dispatch])

  const actions = {
    setStyle,
    beginDrag,
    endDrag,
    drag
  }

  return [state, actions]
}
