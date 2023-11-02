import difference from 'lodash/difference.js'
import isNil from 'lodash/isNil.js'
import map from 'lodash/map.js'
import meanBy from 'lodash/meanBy.js'
import times from 'lodash/times.js'
import uniq from 'lodash/uniq.js'
import without from 'lodash/without.js'

import { useCallback, useMemo, useReducer } from 'react'

export function useReorderStore (layout) {
  const [state, dispatch] = useReducer(reducer, layout, createInitialState)

  const reset = useCallback(() => dispatch({ type: 'RESET', layout }), [dispatch, layout])
  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), [dispatch])
  const reorder = useCallback(keyCenters => dispatch({ type: 'REORDER', keyCenters }), [dispatch])
  const addGroup = useCallback((afterSelected = false) => dispatch({ type: 'ADD_GROUP', afterSelected }), [dispatch])
  const removeGroup = useCallback(() => dispatch({ type: 'REMOVE_GROUP' }), [dispatch])
  const nextGroup = useCallback(() => dispatch({ type: 'NEXT_GROUP' }), [dispatch])
  const prevGroup = useCallback(() => dispatch({ type: 'PREV_GROUP' }), [dispatch])
  const selectRow = useCallback(index => dispatch({ type: 'SELECT_ROW', index }), [dispatch])
  const selectCol = useCallback(index => dispatch({ type: 'SELECT_COL', index }), [dispatch])
  const updateSelection = useCallback((index, mode) => dispatch({ type: 'UPDATE_SELECTION', index, mode }), [dispatch])

  const actions = useMemo(
    () => ({ reset, clear, reorder, selectRow, selectCol, updateSelection, addGroup, removeGroup, nextGroup, prevGroup }),
    [reset, clear, reorder, selectRow, selectCol, updateSelection, addGroup, removeGroup, nextGroup, prevGroup]
  )

  return [state, actions]
}

function reducer (state, action) {
  switch (action.type) {
    case 'RESET':
      return createInitialState(action.layout)

    case 'CLEAR':
      return {
        rows: [[]],
        columns: [[]],
        selectionMode: 'rows',
        selection: 0
      }

    case 'REORDER':
      return reorderGroups(state, action.keyCenters)

    case 'UPDATE_SELECTION':
      return updateMembers(state, action.index, action.mode)

    case 'SELECT_ROW':
      return {
        ...state,
        selectionMode: 'rows',
        selection: action.index
      }

    case 'ADD_GROUP':
      return {
        ...state,
        selection: (
          action.afterSelected
            ? state.selection + 1
            : state[state.selectionMode].length
        ),
        [state.selectionMode]: (
          !action.afterSelected
            ? [...state[state.selectionMode], []]
            : [
                ...state[state.selectionMode].slice(0, state.selection + 1), [],
                ...state[state.selectionMode].slice(state.selection + 1)
              ]
        )
      }

    case 'REMOVE_GROUP':
      return {
        ...state,
        selection: Math.max(0, state.selection - 1),
        [state.selectionMode]: [
          ...state[state.selectionMode].slice(0, state.selection),
          ...state[state.selectionMode].slice(state.selection + 1)
        ]
      }

    case 'NEXT_GROUP':
      return {
        ...state,
        selection: state.selection < state[state.selectionMode].length - 1
          ? state.selection + 1
          : 0
      }

    case 'PREV_GROUP':
      return {
        ...state,
        selection: state.selection === 0
          ? state[state.selectionMode].length - 1
          : state.selection - 1
      }

    case 'SELECT_COL':
      return {
        ...state,
        selectionMode: 'columns',
        selection: action.index
      }

    default:
      throw new Error(`Unknown action type "${action.type}"`)
  }
}

function createInitialState (layout) {
  const rowValues = without(map(layout, 'row'), isNil)
  const colValues = without(map(layout, 'col'), isNil)
  const rows = times(Math.max(...rowValues) + 1, () => [])
  const columns = times(Math.max(...colValues) + 1, () => [])

  layout.forEach(({ row, col }, i) => {
    if (!isNil(row)) rows[row].push(i)
    if (!isNil(col)) columns[col].push(i)
  })

  if (rows.length === 0) rows.push([])
  if (columns.length === 0) columns.push([])

  return {
    rows,
    columns,
    selectionMode: 'rows',
    selection: 0
  }
}

function reorderGroups (state, keyCenters) {
  const rows = state.rows.map(row => meanBy(row.map(i => keyCenters[i]), 'y'))
  const cols = state.columns.map(col => meanBy(col.map(i => keyCenters[i]), 'x'))

  return {
    ...state,
    rows: [...state.rows.keys()].sort((a, b) => rows[a] - rows[b]).map(i => state.rows[i]),
    columns: [...state.columns.keys()].sort((a, b) => cols[a] - cols[b]).map(i => state.columns[i])
  }
}

function updateMembers (state, index, mode) {
  const { selectionMode, selection } = state
  const group = state[selectionMode]
  const indices = [].concat(index)

  switch (mode) {
    case 'add':
      return {
        ...state,
        [selectionMode]: group.map((section, i) => (
          i === selection
            ? uniq([...section, ...indices])
            : difference(section, indices)
        ))
      }
    case 'remove':
      return {
        ...state,
        [selectionMode]: group.map((section, i) => (
          i === selection
            ? difference(section, indices)
            : section
        ))
      }
    case 'replace':
      return {
        ...state,
        [selectionMode]: group.map((section, i) => (
          i === selection
            ? [...indices]
            : difference(section, indices)
        ))
      }
    default:
      throw new Error(`Unknown mode ${mode}`)
  }
}
