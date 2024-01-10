import { parseLayout, parseLayoutFromMatrix } from 'keymap-layout-tools/lib/parse.js'
import { findNodesWithCompatible, getPropertyValues } from './tree.js'

export default function parseLayouts (tree) {
  const matrixTransformNodes = findNodesWithCompatible(tree, 'zmk,matrix-transform')
  const scanMatrixNodes = findNodesWithCompatible(tree, /^"zmk,kscan-/)

  const transformLayouts = parseMatrixTransformLayouts(matrixTransformNodes).filter(value => !!value)
  const scanMatrixLayouts = parseScanMatrixLayouts(scanMatrixNodes).filter(value => !!value)

  return (
    transformLayouts.length
      ? transformLayouts
      : scanMatrixLayouts
  )
}

function parseMatrixTransformLayouts (matrixTransformNodes) {
  return matrixTransformNodes.map(node => {
    const name = node.childForFieldName('name').text
    if (node.parent?.type !== 'labeled_item') {
      console.warn(`Matrix transform node "${name}" does not have a reference`)
      return null
    }
    const label = node.parent.childForFieldName('label').text
    const map = getPropertyValues(node, 'map')?.[0]

    if (!map) {
      console.warn(`Matrix transform node "&${label}" is missing "map" property`)
      return null
    }

    const contents = (
      map.text
        .slice(1, -1)
        .replace(/\t/g, '    ')
        .replace(/\r/g, '')
    )

    const layout = parseLayout(contents)

    return { label, layout }
  })
}

function parseScanMatrixLayouts (scanMatrixNodes) {
  return scanMatrixNodes.map(node => {
    const name = node.childForFieldName('name').text
    if (node.parent?.type !== 'labeled_item') {
      console.warn(`Scan matrix node "${name}" does not have a reference`)
      return null
    }
    const label = node.parent.childForFieldName('label').text

    const compatible = getPropertyValues(node, 'compatible')[0]?.text

    switch (compatible) {
      case '"zmk,kscan-gpio-matrix"':
        return {
          label,
          layout: parseLayoutFromMatrix([
            // If _either_ property is missing we won't actually be able to
            // generate a proper matrix layout from the gpio matrix, but when
            // this happens we're usually dealing with split keyboards where one
            // of these properties (col-gpios, most likely) are specified in the
            // .overlay files for each keyboard half.
            // Even this "fallback" is undesired--just make a matrix transform.
            getPropertyValues(node, 'row-gpios')?.length || 1,
            getPropertyValues(node, 'col-gpios')?.length || 1
          ])
        }

      case '"zmk,kscan-gpio-direct"':
        return {
          label,
          layout: parseLayoutFromMatrix([
            1, getPropertyValues(node, 'input-gpios').length
          ])
        }

      default:
        console.warn(`Unrecognized scan matrix "${compatible}"`)
        return null
    }
  })
}
