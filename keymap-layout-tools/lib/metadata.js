import { formatJson, jsonTable } from './json-formatter.js'

export function formatMetadata (metadata) {
  return formatJson(metadata, [{
    match: (key, value) => Array.isArray(value),
    serialize: value => jsonTable(value).map((line, i) => {
      const original = value[i]
      const originalPrev = value[i - 1]

      return originalPrev && originalPrev.row !== original.row
        ? `\n${line}`
        : line
    })
  }], 2)
}
