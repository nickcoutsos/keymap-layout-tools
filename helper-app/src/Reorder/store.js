import difference from 'lodash/difference.js'
import map from 'lodash/map.js'
import meanBy from 'lodash/meanBy.js'
import times from 'lodash/times.js'
import uniq from 'lodash/uniq.js'

import { useCallback, useMemo, useReducer } from 'react'

export function useReorderStore (layout) {
  const [state, dispatch] = useReducer(reducer, layout, createInitialState)

  const reset = useCallback(() => dispatch({ type: 'RESET', layout }), [dispatch, layout])
  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), [dispatch])
  const reorder = useCallback(keyCenters => dispatch({ type: 'REORDER', keyCenters }), [dispatch])
  const addGroup = useCallback((afterSelected = false) => dispatch({ type: 'ADD_GROUP', afterSelected }), [dispatch])
  const removeGroup = useCallback(() => dispatch({ type: 'REMOVE_GROUP' }), [dispatch])
  const selectRow = useCallback(index => dispatch({ type: 'SELECT_ROW', index }), [dispatch])
  const selectCol = useCallback(index => dispatch({ type: 'SELECT_COL', index }), [dispatch])
  const addToSelected = useCallback(index => dispatch({ type: 'ADD_TO_SELECTED', index }), [dispatch])
  const removeFromSelected = useCallback(index => dispatch({ type: 'REMOVE_FROM_SELECTED', index }), [dispatch])

  const actions = useMemo(
    () => ({ reset, clear, reorder, selectRow, selectCol, addToSelected, removeFromSelected, addGroup, removeGroup }),
    [reset, clear, reorder, selectRow, selectCol, addToSelected, removeFromSelected, addGroup, removeGroup]
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

    case 'ADD_TO_SELECTED':
      return updateMembers(state, action.index, true)

    case 'REMOVE_FROM_SELECTED':
      return updateMembers(state, action.index, false)

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
  const rows = times(Math.max(...map(layout, 'row')) + 1, () => [])
  const columns = times(Math.max(...map(layout, 'col')) + 1, () => [])

  layout.forEach(({ row, col }, i) => {
    rows[row].push(i)
    columns[col].push(i)
  })

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

function updateMembers (state, index, adding) {
  const { selectionMode, selection } = state
  const group = state[selectionMode]
  const indices = [].concat(index)

  if (!adding) {
    return {
      ...state,
      [selectionMode]: group.map((section, i) => (
        i === selection
          ? difference(section, indices)
          : section
      ))
    }
  }

  return {
    ...state,
    [selectionMode]: group.map((section, i) => (
      i === selection
        ? uniq([...section, ...indices])
        : difference(section, indices)
    ))
  }
}
