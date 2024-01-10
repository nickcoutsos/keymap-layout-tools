export function findNodesWithCompatible (tree, compatible) {
  const predicate = createPredicateForCompatible(compatible)
  return searchTree(tree, predicate).map(property => property.parent)
}

function searchTree (tree, predicate, options = {}) {
  const {
    single = false,
    maxDepth = -1
  } = options

  const iter = BreadthFirstIterator(tree, { maxDepth })
  const matches = []
  let node

  while ((node = iter())) {
    if (predicate(node)) {
      if (single) {
        return node
      }

      matches.push(node)
    }
  }

  if (single) {
    return undefined
  }

  return matches
}

export function getPropertyValues (node, property) {
  const propertyNode = node.namedChildren.find(child => (
    child.type === 'property' &&
    child.childForFieldName('name').text === property
  ))
  return propertyNode && getNodeChildrenByFieldName(propertyNode, 'value')
}

export function findLabeledItem (tree, name) {
  let node = searchTree(tree, node => (
    node.type === 'labeled_item' &&
    node.children[0].type === 'identifier' &&
    node.children[0].text === name
  ), { single: true })

  if (!node) {
    return null
  }

  do {
    node = node.childForFieldName('item')
  } while (node.type === 'labeled_item')

  return node
}

export function getNodeChildrenByFieldName (node, fieldName) {
  const children = []

  // Iteration is done with a cursor here because only TreeCursor will directly
  // tell us what field is associated with the current node. The node itself
  // will not tell us about its own field, and Node.childForFieldName(field)
  // will only tell us about a single child with the specified field.
  const cursor = node.walk()
  cursor.gotoFirstChild()

  do {
    const isNamed = cursor.currentNode().isNamed()
    const isField = cursor.currentFieldName() === fieldName
    if (isNamed && isField) {
      children.push(cursor.currentNode())
    }
  } while (cursor.gotoNextSibling())

  cursor.delete()

  return children
}

function createPredicateForCompatible (compatible) {
  let match

  if (compatible instanceof RegExp) {
    match = text => compatible.test(text)
  } else if (typeof compatible === 'string') {
    match = text => text === `"${compatible}"`
  } else if (typeof compatible === 'function') {
    match = compatible
  } else {
    throw new TypeError('Unexpected type ' + typeof compatible)
  }

  return node => (
    node.type === 'property' &&
    node.childForFieldName('name').text === 'compatible' &&
    match(node.childForFieldName('value').text)
  )
}
/**
 *
 * @param {Tree|Node} tree Starting point for breadth-first traversal
 * @param {Object} [options={}]
 * @param {Integer} [options.maxDepth=-1]
 * @returns {Function} get next node, or undefined when traversal is complete
 */
function BreadthFirstIterator (tree, options = {}) {
  const { maxDepth = -1 } = options
  const queue = [{ depth: 0, node: tree.rootNode || tree }]

  return function next () {
    const current = queue.shift()
    if (current && (maxDepth === -1 || current.depth < maxDepth)) {
      queue.push(...current.node.namedChildren.map(node => ({
        node, depth: current.depth + 1
      })))
    }
    return current?.node
  }
}
