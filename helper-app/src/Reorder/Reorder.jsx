import meanBy from 'lodash/meanBy.js'
import { useCallback, useMemo, useState } from 'react'

import { getKeyBoundingBox, transformKeyPolygon } from 'keymap-layout-tools/lib/geometry.js'

import LayoutPreview from '../Common/LayoutPreview.jsx'
import Modal from '../Common/Modal.jsx'
import Key from '../Key.jsx'

import { ColMarker, RowMarker } from './Markers.jsx'
import { useReorderStore } from './store.js'
import styles from './key.module.css'
import classNames from 'classnames'
import { useDragSelector } from './DragSelector.jsx'

const scale = 0.7

export default function Reorder ({ layout, onUpdate, onCancel }) {
  const [state, actions] = useReorderStore(layout)
  const [previewSelection, setPreviewSelection] = useState(null)
  const { selectionMode, selection } = state

  const wrapperStyle = useMemo(() => (
    layout && getWrapperStyle(layout, { scale })
  ), [layout])

  const keyPolygons = useMemo(() => (
    layout.map(key => transformKeyPolygon(
      { x: key.x, y: key.y },
      { u: key.u || key.w || 1, h: key.h || 1 },
      { x: key.rx, y: key.ry, a: key.r }
    ).map(({ x, y }) => ({
      x: scale * x,
      y: scale * y
    })))
  ), [layout])

  const keyCenters = useMemo(() => (
    keyPolygons.map(polygon => ({
      x: meanBy(polygon, 'x'),
      y: meanBy(polygon, 'y')
    }))
  ), [keyPolygons])

  const handleDragSelect = useCallback(({ negate, intersecting }) => {
    negate
      ? actions.removeFromSelected(intersecting)
      : actions.addToSelected(intersecting)
  }, [actions])

  const [dragProps, DragSelectContainer] = useDragSelector({
    onSelect: handleDragSelect,
    polygons: keyPolygons
  })

  const negate = dragProps.negate
  const intersecting = dragProps.selecting
    ? dragProps.intersecting
    : []

  const rowMarkerPositions = useMemo(() => getMarkerPositions(keyCenters, state.rows, 'y'), [keyCenters, state.rows])
  const colMarkerPositions = useMemo(() => getMarkerPositions(keyCenters, state.columns, 'x'), [keyCenters, state.columns])

  const renderKey = useCallback(props => {
    const { index } = props
    const group = state[state.selectionMode][state.selection]
    const selected = group.includes(index)
    const previewMarkerHover = previewSelection !== null && (
      state[previewSelection[0]][
        previewSelection[1]
      ].includes(index)
    )
    const previewDragSelect = negate
      ? intersecting.filter(index => group.includes(index))
      : intersecting.filter(index => !group.includes(index))

    const preview = (
      (!negate && previewDragSelect.includes(index)) ||
      (previewMarkerHover)
    )

    const previewDeselect = negate && previewDragSelect.includes(index)

    return (
      <Key
        {...props}
        onClick={event => {
          event.stopPropagation()
          if (selected) {
            actions.removeFromSelected(index)
          } else {
            actions.addToSelected(index)
          }
        }}
        className={classNames({
          [styles.selected]: selected,
          [styles.preview]: preview,
          [styles.previewDeselect]: previewDeselect
        })}
      />
    )
  }, [
    state,
    actions,
    previewSelection,
    intersecting,
    negate
  ])

  const handleConfirm = useCallback(() => {
    const { rows, columns } = state
    const updatedLayout = applyToLayout(layout, { rows, columns })
    onUpdate(updatedLayout)
  }, [onUpdate, state, layout])

  return (
    <Modal onDismiss={onCancel}>
      <div style={{ background: 'var(--dialog-bg)' }}>
        <div style={{ position: 'relative', ...wrapperStyle }}>
          <DragSelectContainer {...dragProps}>
            <LayoutPreview
              metadata={{ layouts: { LAYOUT: { layout } } }}
              scale={scale}
              renderKey={renderKey}
            />
          </DragSelectContainer>

          {state.rows.map((row, i) => (
            <RowMarker
              key={i}
              number={i}
              active={selectionMode === 'rows' && selection === i}
              onClick={e => { e.stopPropagation(); actions.selectRow(i) }}
              onMouseEnter={() => setPreviewSelection(['rows', i])}
              onMouseLeave={() => setPreviewSelection(null)}
              style={{ left: 0, top: `${rowMarkerPositions[i]}px` }}
            />
          ))}
          {state.columns.map((row, i) => (
            <ColMarker
              key={i}
              number={i}
              active={selectionMode === 'columns' && selection === i}
              onClick={e => { e.stopPropagation(); actions.selectCol(i) }}
              onMouseEnter={() => setPreviewSelection(['columns', i])}
              onMouseLeave={() => setPreviewSelection(null)}
              style={{ top: 0, left: `${colMarkerPositions[i]}px` }}
            />
          ))}
        </div>
        <ReorderingActions
          state={state}
          actions={actions}
          layout={layout}
          keyCenters={keyCenters}
        />
        <div style={{ display: 'flex', gap: '5px', marginTop: '20px', justifyContent: 'center' }}>
          <button onClick={handleConfirm}>Okay</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </Modal>
  )
}

function ReorderingActions ({ state, actions, keyCenters }) {
  const { selectionMode } = state
  const resourceName = selectionMode === 'rows' ? 'row' : 'column'

  const buttons = [
    {
      text: 'Revert',
      tooltip: 'Undo changes and restore original row/col assignments',
      handler: actions.reset
    },
    {
      text: 'Clear all',
      tooltip: 'Remove all but one row/col and remove all key assignments',
      handler: actions.clear
    },
    {
      text: 'Re-order',
      tooltip: 'Order rows and columns by the average key positions on their respective axes',
      handler: () => actions.reorder(keyCenters)
    },
    {
      text: `+ ${resourceName} after selected`,
      tooltip: `Insert a new ${resourceName} group after the currently selected ${resourceName}`,
      handler: () => actions.addGroup(true)
    },
    {
      text: `+ ${resourceName} at end`,
      tooltip: `Insert a new ${resourceName} after all others`,
      handler: () => actions.addGroup(false)
    },
    {
      text: `- ${resourceName}`,
      tooltip: `Remove the current ${resourceName} group`,
      handler: actions.removeGroup,
      disabled: state[selectionMode].length === 1
    }
  ]
  return (
    <div style={{ display: 'flex', gap: '5px', marginTop: '20px', justifyContent: 'center' }}>
      {buttons.map((button, i) => (
        <button
          key={i}
          title={button.tooltip}
          onClick={button.handler}
          disabled={button.disabled}
        >
          {button.text}
        </button>
      ))}
    </div>
  )
}

const notNaN = v => !Number.isNaN(v)

function getMarkerPositions (keyCenters, groups, axis) {
  const positions = groups.map(row => {
    const points = row.map(i => keyCenters[i])
    return meanBy(points, axis)
  })

  let lastGood = 0

  for (let i = 0; i < positions.length; i++) {
    if (notNaN(positions[i])) {
      lastGood = positions[i]
      continue
    }

    const nextGood = positions.slice(i).find(notNaN) || (positions.length * 50)
    lastGood = positions[i] = (lastGood + nextGood) / 2
  }

  return positions
}

function applyToLayout (layout, { rows, columns }) {
  const columnsByKey = columns.reduce((keys, group, i) => ({
    ...keys,
    ...group.reduce((keys, key) => ({
      ...keys, [key]: i
    }), {})
  }), {})

  return rows.flatMap((keys, row) => {
    return keys.map(key => {
      const { row: _, col: __, ...rest } = layout[key]
      const col = columnsByKey[key]
      return { row, col, ...rest }
    }).sort((a, b) => a.col - b.col)
  })
}

function getWrapperStyle (layout, { scale = 1, overrides = {} } = {}) {
  const bbox = layout.map(key => getKeyBoundingBox(
    { x: key.x, y: key.y },
    { u: key.u || key.w || 1, h: key.h || 1 },
    { x: key.rx, y: key.ry, a: key.r }
  )).reduce(({ x, y }, { max }) => ({
    x: Math.max(x, max.x),
    y: Math.max(y, max.y)
  }), { x: 0, y: 0 })

  return {
    width: `${bbox.x * scale}px`,
    height: `${bbox.y * scale}px`,
    margin: '10px auto',
    ...overrides
  }
}
