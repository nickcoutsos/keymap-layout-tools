import cloneDeep from 'lodash/cloneDeep.js'
import isEqual from 'lodash/isEqual.js'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { Button, Dialog, DialogActions, DialogHeading, DialogNote } from '../Common/Dialog.jsx'
import Modal from '../Common/Modal.jsx'
import { selectLayout } from '../metadataSlice'
import { transformers } from './transforms.jsx'

export default function TransformsDialog ({ onSubmit, onClose }) {
  const initialLayout = useSelector(selectLayout)
  const [modifiedLayout, setModifiedLayout] = useState(() => cloneDeep(initialLayout))
  const [selectedTransformer, setSelectedTransformer] = useState('mirror')

  useEffect(() => {
    setModifiedLayout(cloneDeep(initialLayout))
  }, [initialLayout, setModifiedLayout])

  const isModified = useMemo(() => (
    !isEqual(initialLayout, modifiedLayout)
  ), [initialLayout, modifiedLayout])

  const { notes, component: Component } = transformers[selectedTransformer]

  return (
    <Modal onDismiss={onClose}>
      <Dialog style={{ minWidth: '700px' }}>
        <DialogHeading>
          <h2>Transform <select
            value={selectedTransformer}
            style={{ verticalAlign: 'text-top' }}
            onChange={event => setSelectedTransformer(event.target.value)}
          >
            {Object.keys(transformers).map((id, i) => (
              <option key={i} value={id}>{transformers[id].name}</option>
            ))}
          </select></h2>
        </DialogHeading>

        {notes && (
          <DialogNote>
            {notes}
          </DialogNote>
        )}

        <Component
          layout={initialLayout}
          onUpdate={layout => {
            setModifiedLayout(layout)
          }}
        />

        <DialogActions>
          <Button
            onClick={() => onSubmit(modifiedLayout)}
            disabled={!isModified}
          >
            Apply
          </Button>
          <Button onClick={onClose} secondary>
            {isModified ? <span>Cancel</span> : <span>Close</span>}
          </Button>
        </DialogActions>
      </Dialog>
    </Modal>
  )
}
