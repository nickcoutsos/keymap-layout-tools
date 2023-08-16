import { useState, useEffect } from 'react'
import TreeSitter from 'web-tree-sitter'

let _parser

async function getParser () {
  if (!_parser) {
    await TreeSitter.init()
    const language = await TreeSitter.Language.load(
      require('./tree-sitter-devicetree.wasm')
    )
    _parser = new TreeSitter()
    _parser.setLanguage(language)
  }

  return _parser
}

export function useParser () {
  const [loaded, setLoaded] = useState(null)
  useEffect(() => {
    (async function () {
      const parser = await getParser()
      setLoaded(parser)
    })()
  }, [setLoaded])

  if (!loaded) {
    return null
  }

  return loaded
}
