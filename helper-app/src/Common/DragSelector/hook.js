import clamp from 'lodash/clamp.js'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer
} from 'react'

import { bbox, bboxUnion } from 'keymap-layout-tools/lib/geometry'

import {
  getRelativeAncestor,
  getIntersectingPolygons,
  getIntersectingPolygonsTrail
} from './util'

export const DRAG_MODE_ADD = 'add'
export const DRAG_MODE_REMOVE = 'remove'
export const DRAG_MODE_REPLACE = 'replace'

const _DEFAULT_DRAG_MODE = DRAG_MODE_REPLACE

export const DRAG_STYLE_BOX = 'box'
export const DRAG_STYLE_PATH = 'path'

export const DragContext = createContext({})

export function useDragContext () {
  return useContext(DragContext)
}

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

function createInitialState () {
  return {
    style: DRAG_STYLE_BOX,
    mode: _DEFAULT_DRAG_MODE,
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

    case 'begin':
      return {
        ...state,
        start: [
          action.startPoint[0] - action.offsetRect.left,
          action.startPoint[1] - action.offsetRect.top
        ],
        offsetRect: action.offsetRect,
        trail: []
      }

    case 'end':
      return {
        ...state,
        mode: _DEFAULT_DRAG_MODE,
        start: null,
        negate: false,
        trail: null,
        rect: null
      }

    case 'drag':
      return {
        ...state,
        mode: action.mode || state.mode,
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

  const x = clamp(clientX, offsetRect.left, offsetRect.right) - offsetRect.left
  const y = clamp(clientY, offsetRect.top, offsetRect.bottom) - offsetRect.top

  return [
    [Math.min(x, x0), Math.min(y, y0)],
    [Math.max(x, x0), Math.max(y, y0)]
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
