import times from 'lodash/times'

/**
 * Parse a line of `RC(m,n)` values into objects with start/end indices
 * @param {String} row
 * @returns {Array<Object>}
 */
function getKeys (row) {
  const regexp = /(RC\(\s*\d+\s*,\s*\d+\s*\))/g
  const keys = []
  let match

  while ((match = regexp.exec(row)) !== null) {
    keys.push({
      mapping: match[0],
      start: match.index,
      end: regexp.lastIndex
    })
  }

  return keys
}

/**
 * Calculate the vertical overlap between two tokens
 * @param {Object} a - token position with {start, end}
 * @param {Object} b - token position with {start, end}
 * @returns amount of overlap between 0.0 and 1.0
 */
function overlap (a, b) {
  const [left, right] = a.start < b.start ? [a, b] : [b, a]
  if (left.end < right.start) {
    return 0
  }

  const width = Math.min(a.end - a.start, b.end - b.start)
  return (left.end - right.start) / width
}

/**
 * Parse matrix transform map into list of mappings mapped to row and column.
 *
 * The idea is to go through the map line by line (row) and try to match each
 * position up with a column of the previous row. To fit into an existing column
 * the position must overlap another position by at least 50%.
 *
 * It also attempts to handle split keyboards by looking for adjacent columns
 * where every row has sufficient space between consecutive keys.
 *
 * This is a best effort for automation. It works best when the mapping string
 * is already visually grid-like in nature, and this is true for row-staggered
 * keyboards. Even when this is successful it can only roughly determine the key
 * position and not its size.
 *
 * @param {String} bindings multiline representation of a matrix transformation
 * @returns {Array<Object>}
 */
export function parseLayout (bindings) {
  const lines = bindings.split('\n').filter(v => !!v)
  const minIndentation = Math.min(...lines.map(line => (
    line.match(/^\s+/)?.[0]?.length || 0)
  ))

  const unindented = lines.map(line => line.slice(minIndentation))
  const parsed = unindented.reduce((columns, row, i) => {
    const keys = getKeys(row)

    for (const key of keys) {
      let column = columns.find(col => overlap(key, col) >= 0.5)
      if (!column && i > 0) {
        const prevColumns = getKeys(unindented[i - 1])
        const prevColumn = prevColumns.find(col => overlap(key, col) >= 0.5)

        if (prevColumn) {
          column = columns.find(col => (
            !!col.keys.find(row => row.mapping === prevColumn.mapping)
          ))
        }
      }

      if (!column) {
        column = {
          start: key.start,
          end: key.end,
          keys: []
        }
        columns.push(column)
      }

      column.keys.push({ ...key, row: i })
    }

    return columns
  }, [])

  parsed.sort((a, b) => {
    return a.start - b.start
  })

  for (let i = parsed.length - 1; i > 0; i--) {
    const currentColumnStart = Math.min(...parsed[i].keys.map(key => key.start))
    const previousColumnEnd = Math.min(...parsed[i - 1].keys.map(key => key.end))

    if (currentColumnStart - previousColumnEnd > 4) {
      parsed.splice(i, 0, { keys: [] })
    }
  }

  const keys = []
  const totalRows = Math.max(...parsed.map(col => (
    Math.max(...col.keys.map(key => key.row))
  )))

  for (let row = 0; row <= totalRows; row++) {
    parsed.forEach((column, col) => {
      const key = column.keys.find(key => key.row === row)
      if (key) {
        keys.push({ row, col, x: col, y: row })
      }
    })
  }

  return keys
}

export function parseLayoutFromMatrix (size) {
  const [rows, columns] = size

  return [].concat(
    ...times(rows, row => times(columns, col => ({
      row, col, x: col, y: row
    })))
  )
}

module.exports = {
  parseLayout,
  parseLayoutFromMatrix
}
