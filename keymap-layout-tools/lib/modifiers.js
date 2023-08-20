import { getLayoutBoundingRect } from './geometry.js'

export function toOrigin (layout) {
  const bbox = getLayoutBoundingRect(layout)
  return layout.map(key => ({
    ...key,
    x: key.x - bbox.min.x,
    y: key.y - bbox.min.y,
    rx: key.rx - bbox.min.x,
    ry: key.ry - bbox.min.y
  }))
}

/**
 * Flip keys across the Y-axis.
 *
 * Use this to create the second half of a symmetric split keyboard from one
 * the PCB data for a single side.
 *
 * @param {Array<LayoutKey>} layout
 * @returns {Array<LayoutKey>}
 */
export function flip (layout) {
  const maxX = Math.max(...layout.map(k => k.x))
  const maxCol = Math.max(...layout.map(k => k.col))
  const rows = groupByRow(layout)

  return rows.flatMap(row => {
    return row.map(key => ({
      ...key,
      x: maxX - key.x - ((key.w || 1) - 1),
      // rx: maxX - key.rx + 1 - ((key.w || 1) - 1),
      col: maxCol - key.col,
      r: -key.r
    })).reverse()
  })
}

function groupByRow (layout) {
  return layout.reduce((rows, key) => {
    let row = rows.at(-1)
    if (!row || row.at(-1).row !== key.row) {
      row = []
      rows.push(row)
    }

    row.push(key)
    return rows
  }, [])
}

export function mirror (layout, spacing = 0) {
  const maxX = Math.max(...layout.map(k => k.x))
  const maxCol = Math.max(...layout.map(k => k.col))

  const flipped = flip(layout)
  const flippedRows = groupByRow(flipped)

  return groupByRow(layout).flatMap((row, i) => {
    const flippedRow = flippedRows[i]
    return [
      ...row,
      ...flippedRow.map(key => ({
        ...key,
        x: key.x + maxX + spacing,
        col: key.col + maxCol + Math.ceil(spacing)
      }))
    ]
  })
}
