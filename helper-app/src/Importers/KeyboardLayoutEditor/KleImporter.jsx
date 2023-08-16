import { useState, useMemo } from 'react'

import { parseKleLayout } from './parser.js'

import Modal from '../../Modal.jsx'
import styles from '../Kicad/styles.module.css'
import FileSelect from '../Kicad/FileSelect.jsx'
import LayoutPreview from '../Kicad/LayoutPreview.jsx'

export default function KleImporter ({ onSubmit, onCancel }) {
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

  return (
    <Modal onDismiss={onCancel}>
      <div className={styles.dialog}>
        <div className={styles.heading}>
          <h2>Import KLE Layout</h2>
        </div>

        <div className={styles.note}>
          <p>
            KLE's layout format is not great.
          </p>
        </div>

        <h3>1. Select file</h3>
        <FileSelect
          onChange={({ contents }) => setValue(contents)}
          accept=".json"
        />

        <h3>2. Preview</h3>
        {metadata && <LayoutPreview metadata={metadata} />}

        <div style={{ textAlign: 'center', margin: '15px 0 5px' }}>
          <button disabled={!metadata} onClick={() => onSubmit(metadata)}>Import</button>
          <button style={{ background: 'none', border: 'none' }} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </Modal>
  )
}
