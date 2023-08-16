import { useState, useMemo } from 'react'

import { useParser } from './devicetree.js'
import parseLayouts from './parse-layouts.js'

import Modal from '../../Modal.jsx'
import styles from '../Kicad/styles.module.css'
import FileSelect from '../Kicad/FileSelect.jsx'
import LayoutPreview from '../Kicad/LayoutPreview.jsx'

export default function DtsImporter ({ onSubmit, onCancel }) {
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

  return (
    <Modal onDismiss={onCancel}>
      <div className={styles.dialog}>
        <h2 className={styles.heading}>Import Devicetree Layouts</h2>

        <div className={styles.note}>
          <p>
            Note: ZMK matrix transformations can be parsed to generate a very
            basic layout. This works best for ortholinear and columnar staggered
            keyboards but things like key size and rotation can't be guessed and
            may require manual refinement after importing.
          </p>
        </div>

        <h3>1. Select file</h3>
        <FileSelect
          onChange={({ contents }) => setValue(contents)}
          accept=".dts,.dtsi,.overlay"
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
