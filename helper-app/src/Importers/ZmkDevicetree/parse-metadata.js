import parseLayouts from './parse-layouts.js'
import parseSensors from './parse-sensors.js'

export default function parseMetadata (parser, dts) {
  const tree = parser.parse(dts)
  const layouts = parseLayouts(tree)
  const sensors = parseSensors(tree)

  tree.delete()

  return {
    layouts: layouts.reduce((acc, { label, layout }) => ({
      ...acc,
      [label]: { layout }
    }), {}),
    sensors
  }
}
