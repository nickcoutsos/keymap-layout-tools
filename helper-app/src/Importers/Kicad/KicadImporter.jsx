import { useEffect, useState, useMemo } from 'react'

import { useKicadImporter } from './hooks.js'
import ParseOptions from './ParseOptions.jsx'
import styles from './styles.module.css'

import FileSelect from '../../Common/FileSelect.jsx'
import Layout from '../../Common/Layout.jsx'
import Key from '../../Key.jsx'

export default function KicadImporter ({ onUpdate }) {
  const [contents, setContents] = useState('')
  const [options, setOptions] = useState({
    invert: false,
    mirror: false,
    choc: false,
    pattern: '.*'
  })

  const { layout } = useKicadImporter(contents, options)

  useEffect(() => {
    onUpdate({
      layouts: {
        LAYOUT: {
          layout
        }
      }
    })
  }, [layout, onUpdate])

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
      <fieldset disabled={!contents}>
        <ParseOptions options={options} onChange={setOptions} />
      </fieldset>

      <h3>3. Preview</h3>
      {layout && layout.length === 0 && (
        <div className={styles.warning}>
          ⚠️ No switches could be parsed
        </div>
      )}
      {layout && (
        <Layout
          layout={layout}
          overrides={{ margin: '0 auto' }}
        />
      )}
    </>
  )
}
