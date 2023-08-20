import classNames from 'classnames'
import meanBy from 'lodash/meanBy.js'
import { useCallback, useMemo, useState } from 'react'

import { transformKeyPolygon } from 'keymap-layout-tools/lib/geometry.js'
import { setFixedPrecision, toOrigin } from 'keymap-layout-tools/lib/modifiers.js'

import { Dialog, DialogHeading, DialogNote } from '../Common/Dialog.jsx'
import Layout from '../Common/Layout.jsx'
import Modal from '../Common/Modal.jsx'
import Key from '../Key.jsx'

import { useDragSelector } from './DragSelector.jsx'
import { ColMarker, RowMarker } from './Markers.jsx'
import { useReorderStore } from './store.js'
import keyStyles from './key.module.css'
import styles from './reorder.module.css'

const scale = 0.6

export default function Reorder ({ layout: originalLayout, onUpdate, onCancel }) {
  // TODO: do this somewhere else?
  const layout = useMemo(() => setFixedPrecision(toOrigin(originalLayout)), [originalLayout])
  const [state, actions] = useReorderStore(layout)
  const [previewSelection, setPreviewSelection] = useState(null)
  const { selectionMode, selection } = state

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

  // TODO: Add "freeform" line selection
  const [dragProps, DragSelectContainer] = useDragSelector({
    onSelect: handleDragSelect,
    polygons: keyPolygons
  })

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

    const intersecting = dragProps.selecting ? dragProps.intersecting : []
    const previewDragSelect = dragProps.negate
      ? intersecting.filter(index => group.includes(index))
      : intersecting.filter(index => !group.includes(index))

    const preview = (
      (!dragProps.negate && previewDragSelect.includes(index)) ||
      (previewMarkerHover)
    )

    const previewDeselect = dragProps.negate && previewDragSelect.includes(index)

    // TODO: Render RC(r,c) on keys for extra context
    // TODO: indicate keys without current row/col assignments
    // TODO: keyboard shortcuts for next/prev/add group
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
        className={classNames(keyStyles.selectable, {
          [keyStyles.selected]: selected,
          [keyStyles.preview]: preview,
          [keyStyles.previewDeselect]: previewDeselect
        })}
      />
    )
  }, [
    state,
    actions,
    previewSelection,
    dragProps.negate,
    dragProps.selecting,
    dragProps.intersecting
  ])

  const handleConfirm = useCallback(() => {
    const { rows, columns } = state
    const updatedLayout = applyToLayout(layout, { rows, columns })
    onUpdate(updatedLayout)
  }, [onUpdate, state, layout])

  return (
    <Modal>
      <Dialog>
        <DialogHeading>
          <h2>Re-map layout grid</h2>
        </DialogHeading>

        <DialogNote>
          If your layout looks correct visually but the textual layout doesn't,
          you can use this to re-assign keys to the appropriate row and column
          values.
        </DialogNote>

        <div className={styles.gridControllerWrapper}>
          <div className={styles.layoutWrapper} style={{ position: 'relative' }}>
            <DragSelectContainer {...dragProps}>
              <Layout
                layout={layout}
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

          <DialogNote>
            Click on individual keys to add/remove them from the selected row or
            column. Click and drag a region to add (or hold shift to remove) all
            intersecting keys to the selected row/column.
          </DialogNote>
        </div>

        <ReorderingActions
          state={state}
          actions={actions}
          layout={layout}
          keyCenters={keyCenters}
        />

        <div style={{ display: 'flex', gap: '5px', marginTop: '20px', justifyContent: 'center' }}>
          <button onClick={handleConfirm}>Okay</button>
          <button style={{ background: 'none', border: 'none' }} onClick={onCancel}>Cancel</button>
        </div>
      </Dialog>
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

  let lastGoodIndex = 0

  if (Number.isNaN(positions[0])) {
    positions[0] = 0
  }

  for (let i = 0; i < positions.length; i++) {
    if (notNaN(positions[i])) {
      lastGoodIndex = i
      continue
    }

    // If there's still a well-positioned marker ahead then find the distance
    // from the last well-positioned marker and divide that space up.
    const nextGoodIndex = positions.slice(i).findIndex(notNaN)
    if (nextGoodIndex !== -1) {
      const index = nextGoodIndex + i
      const skipped = index - lastGoodIndex
      const distance = positions[index] - positions[lastGoodIndex]
      positions[i] = positions[lastGoodIndex] + distance / skipped * (i - lastGoodIndex)
    } else {
      // When there are no more markers with proper positions just offset
      positions[i] = positions[lastGoodIndex] + 50
      lastGoodIndex = i
    }
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

  const updated = rows.flatMap((keys, row) => {
    return keys.map(key => {
      const { row: _, col: __, ...rest } = layout[key]
      const col = columnsByKey[key]
      return { row, col, ...rest }
    }).sort((a, b) => a.col - b.col)
  })

  return updated
}
