import { createSlice } from '@reduxjs/toolkit'
import { InfoValidationError, validateInfoJson } from 'keymap-layout-tools/lib/validate'
import { formatMetadata, isRawLayout, normalize } from './Code/util'
import corneLayout from './corne-layout.json'

const initialState = {
  text: formatMetadata(corneLayout),
  errors: [],
  parsed: corneLayout,
  selectedLayout: null
}

const metadataSlice = createSlice({
  name: 'metadata',
  initialState,
  reducers: {
    changeSelectedLayout (state, action) {
      state.selectedLayout = action.payload.selectedLayout
    },
    updateFromText (state, action) {
      const { text } = action.payload

      try {
        const parsed = JSON.parse(text)
        const normalized = normalize(parsed)
        validateInfoJson(normalized)

        state.errors = []
        state.text = text
        state.parsed = parsed
        state.selectedLayout = (
          state.selectedLayout in normalized.layouts
            ? state.selectedLayout
            : Object.keys(normalized.layouts)
        )
      } catch (err) {
        state.errors = err instanceof InfoValidationError
          ? err.errors
          : [err.toString()]
      }
    },

    updateFromParsed (state, action) {
      const { metadata, layout } = action.payload

      if (metadata) {
        state.parsed = metadata
      } else if (!isRawLayout(state.parsed)) {
        const defaultLayout = Object.keys(state.parsed.layouts)[0]
        const selectedLayout = state.selectedLayout in state.parsed.layouts
          ? state.selectedLayout
          : defaultLayout

        state.parsed.layouts[selectedLayout].layout = layout
      } else {
        state.parsed = layout
      }

      const normalized = normalize(state.parsed)
      state.text = formatMetadata(state.parsed)
      state.selectedLayout = (
        state.selectedLayout in normalized.layouts
          ? state.selectedLayout
          : Object.keys(normalized.layouts)
      )
    },

    formatText (state) {
      state.text = formatMetadata(state.parsed)
    },

    generateMetadata (state) {
      if (isRawLayout(state.parsed)) {
        state.parsed = normalize(state.parsed)
        state.text = formatMetadata(state.parsed)
      }
    }
  }
})

export const {
  changeSelectedLayout,
  updateFromText,
  updateFromParsed,
  formatText,
  generateMetadata
} = metadataSlice.actions

export const selectMetadata = state => state.metadata

export const selectLayout = state => {
  const { parsed, selectedLayout } = state.metadata
  if (isRawLayout(parsed)) {
    return parsed
  }

  return (
    parsed.layouts[selectedLayout]?.layout ||
    Object.values(parsed.layouts)[0].layout
  )
}

export const selectLayoutNames = state => (
  isRawLayout(state.metadata.parsed)
    ? []
    : Object.keys(state.metadata.parsed.layouts)
)

export default metadataSlice.reducer
