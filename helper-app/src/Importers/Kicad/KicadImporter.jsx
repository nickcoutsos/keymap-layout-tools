import { useEffect, useState, useMemo } from 'react'

import { parseKicadLayout } from 'kicad-to-layout'

import ParseOptions from './ParseOptions.jsx'
import styles from './styles.module.css'

import FileSelect from '../../Common/FileSelect.jsx'
import LayoutPreview from '../../Common/LayoutPreview.jsx'
import { setFixedPrecision } from 'keymap-layout-tools/lib/modifiers.js'

export default function KicadImporter ({ onUpdate }) {
  const [contents, setContents] = useState('')
  const [options, setOptions] = useState({
    invertX: false,
    mirrorX: false,
    choc: false,
    pattern: '.*'
  })

  const layout = useMemo(() => {
    if (!contents) {
      return null
    }

    // TODO: use the individual functions to avoid re-parsing when possible
    const layout = parseKicadLayout(contents, {
      modulePattern: options.pattern,
      invert: options.invertX,
      mirror: options.mirrorX,
      spacing: (
        options.choc
          ? { x: 18.5, y: 17.5 }
          : { x: 19, y: 19 }
      )
    })

    return setFixedPrecision(layout)
  }, [contents, options])

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

  const optionsStyle = !contents
    ? { opacity: 0.5 }
    : {}

  return (
    <>
      <h3>1. Select file</h3>
      <div>
        <FileSelect
          onChange={({ contents }) => setContents(contents)}
          accept=".kicad_pcb"
        />
      </div>

      <h3>2. Options</h3>
      <fieldset disabled={!contents} style={optionsStyle}>
        <ParseOptions options={options} onChange={setOptions} />
      </fieldset>

      <h3>3. Preview</h3>
      {layout && layout.length === 0 && (
        <div className={styles.warning}>
          ⚠️ No switches could be parsed
        </div>
      )}
      {metadata && <LayoutPreview metadata={metadata} />}
    </>
  )
}
