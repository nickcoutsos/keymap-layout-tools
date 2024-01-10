import { useState, useMemo, useEffect } from 'react'

import { useParser } from './devicetree.js'

import FileSelect from '../../Common/FileSelect.jsx'
import LayoutPreview from '../../Common/LayoutPreview.jsx'
import parseMetadata from './parse-metadata.js'

export default function DtsImporter ({ onUpdate }) {
  const [value, setValue] = useState('')
  const parser = useParser()

  const metadata = useMemo(() => {
    if (!value || !parser) {
      return null
    }

    return parseMetadata(parser, value)
  }, [value, parser])

  useEffect(() => {
    onUpdate(metadata)
  }, [metadata, onUpdate])

  return (
    <>
      <h3>1. Select file</h3>
      <FileSelect
        onChange={({ contents }) => setValue(contents)}
        accept=".dts,.dtsi,.overlay"
      />

      <h3>2. Preview</h3>
      {metadata && <LayoutPreview metadata={metadata} />}
    </>
  )
}
