import {
  findLabeledItem,
  findNodesWithCompatible,
  getPropertyValues
} from './tree.js'

export default function parseSensors (tree) {
  const [sensorsNode] = findNodesWithCompatible(tree, 'zmk,keymap-sensors')

  if (!sensorsNode) {
    return []
  }

  const references = getPropertyValues(sensorsNode, 'sensors')
    .flatMap(cells => (
      cells.namedChildren
        .filter(node => node.type === 'reference')
        .map(node => node.text.replace(/^&/, ''))
    ))

  return references.map(ref => {
    const node = findLabeledItem(tree, ref)
    const identifier = node.childForFieldName('name').text
    const compatible = getPropertyValues(node, 'compatible')[0]?.text.slice(1, -1)
    const status = getPropertyValues(node, 'status')[0]?.text.slice(1, -1)

    return {
      ref,
      name: identifier,
      identifier,
      compatible,
      enabled: status === 'okay'
    }
  })
}
