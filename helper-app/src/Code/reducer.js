import { useReducer } from 'react'

import { InfoValidationError } from 'keymap-layout-tools/lib/validate'
import { isRawLayout, formatMetadata, normalize } from './util'

export default function useCodeReducer (value) {
  return useReducer(reducer, value, init)
}

export function reducer (state, action = {}) {
  const { payload, type } = action
  switch (type) {
    case 'updated':
      return {
        ...state,
        text: payload.text,
        errors: [],
        parsed: payload.parsed,
        selectedLayout: getSelectedLayout(payload.parsed, state.selectedLayout)
      }

    case 'errored':
      return {
        ...state,
        text: payload.text,
        errors: payload.err instanceof InfoValidationError
          ? payload.err.errors
          : [payload.err.toString()]
      }

    case 'reFormatted':
      return { ...state, text: formatMetadata(state.parsed) }

    case 'toMetadata':
      return !isRawLayout(state.parsed)
        ? state
        : ({
            ...state,
            parsed: {
              layouts: {
                default: {
                  layout: state.parsed
                }
              }
            },
            text: formatMetadata({
              layouts: {
                default: {
                  layout: state.parsed
                }
              }
            })
          })

    case 'reOrdered':
      return reduceReorderedLayout(state, action)

    case 'selectedLayout':
      return { ...state, selectedLayout: payload.selectedLayout }

    case 'imported':
      return {
        ...state,
        parsed: payload.layout,
        selectedLayout: null,
        text: formatMetadata(payload.layout),
        modal: null
      }

    case 'openedModal':
      return { ...state, modal: payload.modal }

    case 'closedModal':
      return { ...state, modal: null }

    default:
      return state
  }
}

export function init (value) {
  const initialParse = normalize(JSON.parse(value))

  return {
    modal: null,
    text: value,
    errors: [],
    parsed: initialParse,
    selectedLayout: Object.keys(initialParse.layouts)[0]
  }
}

function getSelectedLayout (metadata, selected) {
  metadata = normalize(metadata)
  const defaultLayout = Object.keys(metadata.layouts)[0]

  return selected in metadata.layouts ? selected : defaultLayout
}

function reduceReorderedLayout (state, action) {
  const { layout } = action.payload
  const original = state.parsed
  let updated = layout

  if (!isRawLayout(original)) {
    const defaultLayout = Object.keys(original.layouts)[0]
    const selectedLayout = state.selectedLayout in original.layouts
      ? state.selectedLayout
      : defaultLayout

    updated = {
      ...original,
      layouts: {
        ...original.layouts,
        [selectedLayout]: {
          ...original.layouts[selectedLayout],
          layout
        }
      }
    }
  }

  return {
    ...state,
    modal: null,
    parsed: updated,
    text: formatMetadata(updated)
  }
}
