import { useState } from 'react'

import ZmkDtsImporter from './ZmkDevicetree/DtsImporter.jsx'
import KicadImporter from './Kicad/KicadImporter.jsx'
import KleImporter from './KeyboardLayoutEditor/KleImporter.jsx'
import styles from './styles.module.css'

import Modal from '../Common/Modal.jsx'

const importers = {
  dts: {
    name: 'ZMK Devicetree',
    component: ZmkDtsImporter,
    notes: (
      <p>
        ZMK matrix transformations can be parsed to generate very basic layouts.
        This works best for ortholinear and column-staggered keyboards but
        details like key size and rotation can't be guessed and may require
        refinement after importing.
      </p>
    )
  },
  kicad: {
    name: 'Kicad PCB',
    component: KicadImporter,
    notes: (
      <>
        <p>
          Importing switch data from a Kicad PCBs will yield the most accurate
          position and rotation details but they are often not ordered the same
          way they'd be used in keymap bindings. Depending on the PCB there may
          be some manual sorting required, especially
          for <code>row</code> / <code>col</code> properties.
        </p>
        <p>This is still in progress.</p>
      </>
    )
  },
  kle: {
    name: 'KLE JSON',
    component: KleImporter,
    notes: (
      <p>
        Make sure you're using the exported output
        from <code>Download JSON</code>, and <strong>not</strong> from
        the <code>Raw Data</code> tab.
      </p>
    )
  }
}

export default function Importer ({ onSubmit, onCancel }) {
  const [selectedImporter, setSelectedImporter] = useState('dts')
  const [importedData, setImportedData] = useState(null)

  const { notes, component: Component } = importers[selectedImporter]

  return (
    <Modal>
      <div className={styles.dialog}>
        <div className={styles.heading}>
          <h2>Import from <select
            value={selectedImporter}
            style={{ verticalAlign: 'text-top' }}
            onChange={event => setSelectedImporter(event.target.value)}
          >
            {Object.keys(importers).map((id, i) => (
              <option key={i} value={id}>{importers[id].name}</option>
            ))}
          </select></h2>
        </div>

        {notes && (
          <div className={styles.note}>
            {notes}
          </div>
        )}

        <Component onUpdate={setImportedData} />

        <div style={{ textAlign: 'center', margin: '20px 0 5px' }}>
          <button disabled={!importedData} onClick={() => onSubmit(importedData)}>Import</button>
          <button style={{ background: 'none', border: 'none' }} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </Modal>
  )
}
