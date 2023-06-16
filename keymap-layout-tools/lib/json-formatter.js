/**
 * Like JSON.stringify except with the ability to apply custom serialization to
 * certain values.
 * @param {*} obj
 * @param {Array<Object>} replacers one or more pairs of match and replace functions
 * @param {Number} space passed to JSON.stringify
 * @returns {String}
 */
export function formatJson (obj, replacers, space) {
  let reformatCounter = 0
  const reformatTokenPrefix = '$$reformatting$$'
  const toReformat = {}

  function toJSON (key, value) {
    for (const replacer of replacers) {
      if (replacer.match(key, value)) {
        const token = `${reformatTokenPrefix}${++reformatCounter}`
        toReformat[token] = replacer.serialize(value)
        return [token]
      }
    }

    return value
  }

  const firstPass = JSON.stringify(obj, toJSON, '  ')
  return Object.keys(toReformat).reduce((str, token) => {
    const pattern = new RegExp(String.raw`\[\s*"${token.replace(/\$/g, '\\$')}"\s*\]`)
    const matches = str.match(pattern)
    const indentation = matches[0].match(/\n(\s+)\]/)
    const reformattedItems = toReformat[token]
    const replacement = reformattedItems.length < 2
      ? `[${reformattedItems.join(', ')}]`
      : [
          '[',
          ...reformattedItems.map((line, i, arr) => (
            line + ((i === arr.length - 1) ? '' : ',')
          )),
          ']'
        ].join('\n')

    return str.replace(matches[0], reindent(replacement, indentation?.[1] || '').trimStart())
  }, firstPass)
}

/**
 * Format an array of similarly-keyed objects into a "table".
 *
 * Assuming all of the supplied objects have at least some of the same keys this
 * function will format each object into its own JSON formatted string such that
 * columns and values are all aligned. Values are all right-aligned, and in the
 * case that an object is missing a column present in other rows whitespace will
 * be rendered in its place.
 * @param {Array<Object>} rows
 * @returns {Array<String>}
 */
export function jsonTable (rows) {
  // Values must be stringified so that additional characters like quotation
  // marks wrapping or within strings are factored into column widths.
  rows = rows.map(row => (
    Object.keys(row).reduce((acc, key) => ({
      ...acc, [key]: JSON.stringify(row[key])
    }), {})
  ))

  const columnWidths = rows.reduce((widths, row) => {
    for (const col in row) {
      widths[col] = Math.max(
        row[col].toString().length,
        widths[col] || 0
      )
    }

    return widths
  }, {})

  return rows.map(row => {
    const columns = Object.keys(columnWidths).reduce((columns, col, i) => {
      const lastBlank = columns.at(-1)?.match(/^\s*$/) ? columns.pop() + '  ' : ''

      if (col in row) {
        const width = columnWidths[col]
        const val = row[col]
        columns.push(`${lastBlank}"${col}": ${val.padStart(width)}`)
      } else {
        const newBlank = ' '.repeat(col.length + 4 + columnWidths[col])
        columns.push(lastBlank + newBlank)
      }

      return columns
    }, [])

    if (columns.at(-1).match(/^\s*$/)) {
      columns.pop()
    }

    return `  { ${columns.join(', ')} }`
  })
}

/**
 * Replace base indentation with a custom indentation string on all lines
 * @param {String} text
 * @param {String} indentation
 * @returns {String}
 */
function reindent (text, indentation) {
  const lines = text.split('\n')
  const minIndentation = lines.reduce((leastIndentation, line) => {
    const match = line.match(/^(\s*)\S/)

    if (!match) {
      return leastIndentation
    }

    return Math.min(leastIndentation, match[1].length)
  }, Infinity)

  return lines.map(line => (
    line.slice(0, minIndentation).match(/^\s+$/)
      ? line.slice(minIndentation)
      : line
  )).map(line => indentation + line)
    .join('\n')
}
