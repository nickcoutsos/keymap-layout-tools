import { useState } from 'react'
import { useSelector } from 'react-redux'

import { Dialog, DialogHeading } from '../Common/Dialog.jsx'
import Layout from '../Common/Layout.jsx'
import Modal from '../Common/Modal.jsx'
import Key from '../Key.jsx'
import { selectLayout } from '../metadataSlice'

import Options, { DEFAULT_OPTIONS } from './Options.jsx'
import { useMirrorTransform } from './hooks'
import styles from './styles.module.css'

export default function MirrorDialog ({ onSubmit, onCancel }) {
  const initialLayout = useSelector(selectLayout)
  const [options, setOptions] = useState(DEFAULT_OPTIONS)
  const { mirrored } = useMirrorTransform(initialLayout, options)

  return (
    <Modal onDismiss={onCancel}>
      <Dialog style={{ minWidth: '700px' }}>
        <div className={styles.mirrorDialog}>
          <DialogHeading>
            <h2>Mirror/Flip Layout</h2>
          </DialogHeading>

          <h3>Options</h3>
          <fieldset>
            <Options options={options} onChange={setOptions} />
          </fieldset>

          <h3>Preview</h3>
          {mirrored && (
            <Layout
              layout={mirrored}
              scale={0.5}
              overrides={{ margin: '0 auto' }}
              renderKey={renderSwitch}
            />
          )}

          <div style={{ textAlign: 'center', margin: '20px 0 5px' }}>
            <button onClick={() => onSubmit(mirrored)}>Confirm</button>
            <button style={{ background: 'none', border: 'none' }} onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </Dialog>
    </Modal>
  )
}

function renderSwitch ({ keyLayout }) {
  return (
    <Key
      index={keyLayout._switch?.name}
      keyLayout={keyLayout}
      title={[
        `Module/footprint label: "${keyLayout._switch?.mod}"`,
        `Switch label: "${keyLayout._switch?.name}"`
      ].join('\n')}
    />
  )
}
