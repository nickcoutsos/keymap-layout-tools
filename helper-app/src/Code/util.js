import { formatJson, jsonTable } from './formatter'

export function formatMetadata (metadata) {
  return formatJson(metadata, [{
    match: (key, value) => Array.isArray(value),
    serialize: value => jsonTable(value)
  }], 2)
}

export function isRawLayout (data) {
  return Array.isArray(data)
}
