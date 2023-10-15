import { getLayoutBoundingRect } from './geometry.js'

export function toOrigin (layout) {
  const bbox = getLayoutBoundingRect(layout, { keySize: 1, padding: 0 })

  return layout.map(key => {
    const transformed = { ...key }

    transformed.x = key.x - bbox.min.x
    transformed.y = key.y - bbox.min.y
    if ('rx' in key) transformed.rx = key.rx - bbox.min.x
    if ('ry' in key) transformed.ry = key.ry - bbox.min.y

    return transformed
  })
}

export function setFixedPrecision (layout, precision = 3) {
  return layout.map(layoutKey => {
    const transformed = { ...layoutKey }

    for (const prop in transformed) {
      const value = transformed[prop]
      if (typeof value === 'number' && Math.round(value) !== value) {
        transformed[prop] = Number(value.toFixed(precision))
      }
    }

    return transformed
  })
}

/**
 * Flip keys across the Y-axis.
 *
 * Use this to create the second half of a symmetric split keyboard from one
 * the PCB data for a single side.
 *
 * @param {Array<LayoutKey>} layout
 * @param {Object} [options={}]
 * @param {Boolean} [options.referenceOriginal=false] add reference to original key index
 * @returns {Array<LayoutKey>}
 */
export function flip (layout, { referenceOriginal = false } = {}) {
  const maxX = Math.max(...layout.map(k => k.x))
  const maxCol = Math.max(...layout.map(k => k.col))
  const rows = groupByRow(layout)

  return rows.reduce((layout, row) => ([
    ...layout,
    ...row.map((key, i) => {
      const newKey = { ...key }
      newKey.x = maxX - key.x - ((key.w || 1) - 1)
      newKey.col = maxCol - key.col

      if ('r' in key) {
        newKey.r = -key.r
      }
      if ('rx' in key) {
        newKey.rx = newKey.x + (key.x - key.rx) * -1
      }

      if (referenceOriginal) {
        newKey._original = layout.length + i
      }

      return newKey
    }).reverse()
  ]), [])
}

/**
 * Group a layout's keys by their `row` property.
 *
 * This assumes that keys are already in ascending order of `row`.
 *
 * @param {Array<LayoutKey>} layout
 * @returns {Array<Array<LayoutKey>>}
 */
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

/**
 * Mirror one half of a split keyboard to produce a full layout
 *
 * @param {Array<LayoutKey>} layout
 * @param {Object} [options={}]
 * @param {Number} [options.gap=0] space to leave between mirrored halves
 * @param {Boolean} [options.referenceOriginal=false] add reference to original key index
 * @returns {Array<LayoutKey>}
 */
export function mirror (layout, { gap = 0, referenceOriginal = false } = {}) {
  const maxX = Math.max(...layout.map(k => k.x))
  const maxCol = Math.max(...layout.map(k => k.col))

  if (referenceOriginal) {
    layout = layout.map((key, i) => ({
      ...key, _original: i
    }))
  }

  const flipped = flip(layout, { referenceOriginal })
  const flippedRows = groupByRow(flipped)

  return groupByRow(layout).reduce((layout, row, i) => [
    ...layout,
    ...row,
    ...flippedRows[i].map(key => {
      const mirroredKey = { ...key }
      mirroredKey.x = key.x + maxX + gap
      mirroredKey.col = key.col + maxCol + Math.ceil(gap)

      if ('rx' in mirroredKey) {
        mirroredKey.rx = mirroredKey.rx + maxX + gap
      }

      if (referenceOriginal) {
        mirroredKey._original = key._original
        mirroredKey._duplicate = true
      }

      return mirroredKey
    })
  ], [])
}
