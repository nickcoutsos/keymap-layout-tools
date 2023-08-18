import { useState, useMemo, useEffect } from 'react'

import { parseKleLayout } from './parser.js'

import FileSelect from '../../Common/FileSelect.jsx'
import LayoutPreview from '../../Common/LayoutPreview.jsx'

export default function KleImporter ({ onUpdate }) {
  const [value, setValue] = useState('')

  const layout = useMemo(() => {
    if (!value) {
      return null
    }

    const json = JSON.parse(value)

    return parseKleLayout(json)
  }, [value])

  const metadata = useMemo(() => layout && ({
    layouts: {
      LAYOUT: {
        layout
      }
    }
  }), [layout])

  useEffect(() => {
    onUpdate(metadata)
  }, [metadata, onUpdate])

  return (
    <>
      <h3>1. Select file</h3>
      <FileSelect
        onChange={({ contents }) => setValue(contents)}
        accept=".json"
      />

      <h3>2. Preview</h3>
      {metadata && <LayoutPreview metadata={metadata} />}
    </>
  )
}
