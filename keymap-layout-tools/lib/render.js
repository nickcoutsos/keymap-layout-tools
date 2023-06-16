import times from 'lodash/times.js'

export default function renderLayout (layout, layer, opts = {}) {
  const { margin = 2 } = opts
  const table = layer.reduce((map, code, i) => {
    // TODO: this would be better as a loop over `layout`, checking for a
    // matching element in the `layer` array. Or, alternatively, an earlier
    // validation that asserts each layer is equal in length to the number of
    // keys in the layout.
    if (layout[i]) {
      const { row = 0, col } = layout[i]
      map[row] = map[row] || []
      map[row][col || map[row].length] = code
    }

    return map
  }, [])

  const rowIndices = Object.keys(table)
  const columns = Math.max(...rowIndices.map(i => table[i].length))
  const columnIndices = times(columns, n => n)
  const columnWidths = columnIndices.map(col => Math.max(
    ...rowIndices.map(row => table[row][col]?.length || 0)
  ))

  return table.map((row, i) => {
    return columnIndices.map(i => {
      const noMoreValues = row.slice(i).every(col => col === undefined)
      const padding = columnWidths[i] + (
        i === 0 ? '' : margin
      )

      if (noMoreValues) return ''
      if (!row[i]) return ' '.repeat(padding)
      return row[i].padStart(padding)
    }).join('').replace(/\s+$/, '')
  }).join('\n')
}
