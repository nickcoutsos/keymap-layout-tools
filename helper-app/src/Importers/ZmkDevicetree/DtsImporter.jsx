import { useState, useMemo, useEffect } from 'react'

import { useParser } from './devicetree.js'
import parseLayouts from './parse-layouts.js'

import FileSelect from '../../Common/FileSelect.jsx'
import LayoutPreview from '../../Common/LayoutPreview.jsx'

export default function DtsImporter ({ onUpdate }) {
  const [value, setValue] = useState('')
  const parser = useParser()

  const layouts = useMemo(() => {
    if (!value || !parser) {
      return []
    }

    return parseLayouts(parser, value)
  }, [value, parser])

  const metadata = useMemo(() => {
    if (!layouts?.length) {
      return null
    }

    return {
      layouts: layouts.reduce((acc, result) => ({
        ...acc,
        [result.label]: {
          layout: result.layout
        }
      }), {})
    }
  }, [layouts])

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
