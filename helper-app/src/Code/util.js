import { formatJson, jsonTable } from './formatter'
export { parseKleLayout } from '../Importers/KeyboardLayoutEditor/parser.js'

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

export function isKleLayout (data) {
  return (
    Array.isArray(data) &&
    data.every(item => (
      typeof item === 'string' ||
      typeof item === 'object'
    )) &&
    data.some(item => typeof item === 'string')
  )
}

export function isRawLayout (data) {
  return Array.isArray(data)
}
