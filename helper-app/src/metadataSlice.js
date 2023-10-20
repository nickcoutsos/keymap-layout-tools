import cloneDeep from 'lodash/cloneDeep.js'
import uniq from 'lodash/uniq.js'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { InfoValidationError, validateInfoJson } from 'keymap-layout-tools/lib/validate'
import { formatMetadata, isRawLayout, normalize } from './Code/util'

const initialState = {
  text: '',
  errors: [],
  parsed: null,

  // TODO: Move these into a different state slice
  keySelection: [],
  selectedLayout: null
}

const metadataSlice = createSlice({
  name: 'metadata',
  initialState,
  reducers: {
    changeSelectedLayout (state, action) {
      state.selectedLayout = action.payload.selectedLayout
      state.keySelection = []
    },
    metadataUpdated (state, action) {
      const { text, parsed } = action.payload
      const normalized = normalize(parsed)
      const defaultLayout = Object.keys(normalized.layouts)[0]

      state.errors = []
      state.parsed = parsed
      state.text = text
      state.keySelection = []
      state.selectedLayout = (
        state.selectedLayout in normalized.layouts
          ? state.selectedLayout
          : defaultLayout
      )
    },
    metadataInvalid (state, action) {
      const { errors } = action.payload
      state.errors = errors
    },
    updateKeySelection (state, action) {
      const { keys, append = false } = action.payload
      state.keySelection = uniq(
        append
          ? [...state.keySelection, ...keys]
          : [...keys]
      )
    }
  }
})

export const {
  changeSelectedLayout,
  metadataUpdated,
  metadataInvalid,
  updateKeySelection
} = metadataSlice.actions

export const updateMetadata = createAsyncThunk(
  'metadata/update',
  async ({ text, layout, metadata }, { dispatch, getState }) => {
    let parsed
    if (text) {
      try {
        parsed = JSON.parse(text)
        const normalized = normalize(parsed)
        validateInfoJson(normalized)
      } catch (err) {
        const errors = err instanceof InfoValidationError
          ? err.errors
          : [err.toString()]

        dispatch(metadataInvalid({ errors }))
        return
      }
    } else if (layout) {
      const state = getState().metadata
      if (!isRawLayout(state.parsed)) {
        parsed = cloneDeep(state.parsed)
        const defaultLayout = Object.keys(parsed.layouts)[0]
        const selectedLayout = state.selectedLayout in parsed.layouts
          ? state.selectedLayout
          : defaultLayout
        parsed.layouts[selectedLayout].layout = layout
      } else {
        parsed = layout
      }
      text = formatMetadata(parsed)
    } else if (metadata) {
      parsed = metadata
      text = formatMetadata(parsed)
    }

    dispatch(metadataUpdated({ parsed, text }))
  }
)

export const formatText = createAsyncThunk(
  'metadata/format',
  (_, { dispatch, getState }) => {
    const { parsed } = getState()
    const formatted = formatMetadata(parsed)
    dispatch(updateMetadata({ text: formatted }))
  }
)

export const generateMetadata = createAsyncThunk(
  'metadata/wrap',
  (_, { dispatch, getState }) => {
    const { parsed } = getState()
    if (isRawLayout(parsed)) {
      dispatch(updateMetadata({
        metadata: normalize(parsed)
      }))
    }
  }
)

export const selectMetadata = state => state.metadata

export const selectActiveLayout = state => state.metadata.selectedLayout

export const selectLayout = state => {
  const { parsed, selectedLayout } = state.metadata
  if (!parsed) {
    return null
  }

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

export const selectKeySelection = state => state.metadata.keySelection

export default metadataSlice.reducer
