import TreeSitter from 'web-tree-sitter'

let parser

async function getParser () {
  if (!parser) {
    await TreeSitter.init()
    const TreeSitterJson = await TreeSitter.Language.load(
      require('./tree-sitter-json.wasm')
    )
    parser = new TreeSitter()
    parser.setLanguage(TreeSitterJson)
  }

  return parser
}

/**
 * @typedef {Object} KeyTextMapping
 * @property {Number} start
 * @property {Number} end
 */

/** @typedef {Array<KeyTextMapping>} LayoutTextMapping */

/**
 * Parse metadata/layout JSON to map key layout objects to their positions in the document
 * @param {String} text JSON-encoded layout/metadata
 * @returns {Array<LayoutTextMapping>}
 */
export async function getTextMapping (text) {
  const parser = await getParser()
  const tree = parser.parse(text)
  const layouts = tree.rootNode.firstChild.type === 'array'
    ? [tree.rootNode.firstChild]
    : getLayoutObjectASTs(tree.rootNode.firstChild)

  const keyIndices = layouts.map(layout => (
    layout.namedChildren
      .filter(node => node.type === 'object')
      .map(node => ({ start: node.startIndex, end: node.endIndex }))
  ))

  tree.delete()

  return keyIndices
}

function getObjectPropertyAST (node, propertyName) {
  const keyText = `"${propertyName}"`
  const matchKey = node => node.childForFieldName('key').text === keyText

  for (const child of node.namedChildren) {
    if (child.type === 'pair' && matchKey(child)) {
      return child.childForFieldName('value')
    }
  }
}

function getLayoutObjectASTs (tree) {
  return (
    (getObjectPropertyAST(tree, 'layouts')?.namedChildren || [])
      .filter(node => node.type === 'pair')
      .map(node => getObjectPropertyAST(
        node.childForFieldName('value'),
        'layout'
      ))
  )
}
