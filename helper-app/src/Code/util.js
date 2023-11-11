export { parseKleLayout } from '../Importers/KeyboardLayoutEditor/parser.js'

export function normalize (layoutOrMetadata) {
  return isRawLayout(layoutOrMetadata)
    ? { layouts: { default: { layout: layoutOrMetadata } } }
    : layoutOrMetadata
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
