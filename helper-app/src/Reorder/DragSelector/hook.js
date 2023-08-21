import clamp from 'lodash/clamp.js'
import { useCallback, useEffect, useMemo, useReducer } from 'react'

import { bbox, bboxUnion } from 'keymap-layout-tools/lib/geometry'

import {
  getRelativeAncestor,
  getIntersectingPolygons
} from './util'

export function useDragSelector ({ polygons, onSelect }) {
  const [state, actions] = useDragStateReducer()
  const {
    start,
    mode,
    rect
  } = state

  const {
    setStyle,
    setMode,
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

    return getIntersectingPolygons(rect, polygons)
  }, [polygons, selecting, rect])

  const handleMouseDown = useCallback(event => {
    const offsetElement = getRelativeAncestor(event.target)
    const rect = offsetElement.getBoundingClientRect()
    const { clientX: x, clientY: y } = event

    event.preventDefault()
    beginDrag([x, y], rect)
  }, [beginDrag])

  const handleChangeMode = useCallback(style => (
    setStyle(style)
  ), [setStyle])

  const handleKeyDown = useCallback(event => {
    if (mode === 'add' && event.shiftKey) {
      setMode('remove')
    }
  }, [mode, setMode])

  const handleKeyUp = useCallback(event => {
    if (mode === 'remove' && !event.shiftKey) {
      setMode('add')
    }
  }, [mode, setMode])

  const handleMouseMove = useCallback(event => {
    if (start) {
      drag(event.clientX, event.clientY)
    }
  }, [start, drag])

  const handleMouseUp = useCallback(event => {
    if (!start) {
      return
    }

    if (selecting) {
      onSelect({
        mode,
        intersections,

        // DEPRECATE
        negate: mode === 'remove',
        intersecting: intersections
      })
    }

    endDrag()
  }, [onSelect, intersections, mode, start, selecting, endDrag])

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleMouseUp, handleMouseMove, handleKeyDown, handleKeyUp])

  return {
    ...state,
    boundingBox,
    selecting,
    intersections,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove
    },

    // DEPRECATED
    // TODO: remove
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onChangeMode: handleChangeMode,
    intersecting: intersections,
    negate: mode === 'remove'
  }
}

function useDragStateReducer () {
  const [state, dispatch] = useReducer(reducer, null, createInitialState)

  const setStyle = useCallback(style => dispatch({ type: 'set_style', style }), [dispatch])
  const setMode = useCallback(mode => dispatch({ type: 'set_mode', mode }), [dispatch])
  const beginDrag = useCallback((startPoint, offsetRect) => dispatch({ type: 'begin', startPoint, offsetRect }), [dispatch])
  const endDrag = useCallback(() => dispatch({ type: 'end' }), [dispatch])
  const drag = useCallback((clientX, clientY) => dispatch({ type: 'drag', clientX, clientY }), [dispatch])

  const actions = {
    setStyle,
    setMode,
    beginDrag,
    endDrag,
    drag
  }

  return [state, actions]
}

function createInitialState () {
  return {
    style: 'box',
    mode: 'add',
    start: null,
    trail: null,
    rect: null,
    offsetRect: null
  }
}

function reducer (state, action) {
  switch (action.type) {
    case 'set_style':
      return { ...state, style: action.style }

    case 'set_mode':
      return { ...state, mode: action.mode }

    case 'begin':
      return {
        ...state,
        start: action.startPoint,
        offsetRect: action.offsetRect,
        trail: []
      }

    case 'end':
      return {
        ...state,
        start: null,
        negate: false,
        trail: null,
        rect: null
      }

    case 'drag':
      return {
        ...state,
        rect: getDragRect(state, action),
        trail: getDragTrail(state, action)
      }

    default:
      throw new Error(`Unknown action "${action.type}"`)
  }
}

function getDragRect (state, action) {
  const { start, offsetRect } = state
  const { clientX, clientY } = action
  const [x0, y0] = start

  const x = clamp(clientX, offsetRect.left, offsetRect.right)
  const y = clamp(clientY, offsetRect.top, offsetRect.bottom)

  return [
    [Math.min(x, x0) - offsetRect.left, Math.min(y, y0) - offsetRect.top],
    [Math.max(x, x0) - offsetRect.left, Math.max(y, y0) - offsetRect.top]
  ]
}

function getDragTrail (state, action) {
  const { trail, offsetRect } = state
  const { clientX, clientY } = action
  const next = [
    clientX - offsetRect.left,
    clientY - offsetRect.top
  ]

  return [...trail, next]
}
