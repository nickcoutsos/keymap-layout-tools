import clamp from 'lodash/clamp.js'
import {
  DRAG_MODE_REPLACE,
  DRAG_STYLE_BOX
} from './constants.js'

const _DEFAULT_DRAG_MODE = DRAG_MODE_REPLACE

export function createInitialState () {
  return {
    style: DRAG_STYLE_BOX,
    mode: _DEFAULT_DRAG_MODE,
    start: null,
    trail: null,
    rect: null,
    offsetRect: null
  }
}

export function reducer (state, action) {
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
