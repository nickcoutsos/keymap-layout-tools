import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import styles from './styles.module.css'
import {
  changeSelectedLayout,
  formatText,
  generateMetadata,
  selectLayout,
  selectLayoutNames,
  selectMetadata,
  updateMetadata
} from './metadataSlice'
import { isRawLayout } from './Code/util'
import Reorder from './Reorder/Reorder.jsx'
import Importer from './Importers/Importer.jsx'
import MirrorDialog from './MirrorDialog/MirrorDialog.jsx'

export default function Actions () {
  const dispatch = useDispatch()
  const layout = useSelector(selectLayout)
  const [modal, setModal] = useState(null)
  const close = useCallback(() => setModal(null), [setModal])

  return (
    <div className={styles.actions}>
      <LayoutSwitcher />
      <ReformatButton />
      <MetadataButton />
      <button onClick={() => setModal('reorder')}>Re-order</button>
      <button onClick={() => setModal('importer')}>
        Import...
      </button>
      <button onClick={() => setModal('mirror')}>
        Mirror
      </button>

      {modal === 'reorder' && (
        <Reorder
          layout={layout}
          onUpdate={layout => {
            dispatch(updateMetadata({ layout }))
            setModal(null)
          }}
          onCancel={close}
        />
      )}
      {modal === 'importer' && (
        <Importer
          onSubmit={metadata => {
            dispatch(updateMetadata({ metadata }))
            setModal(null)
          }}
          onCancel={close}
        />
      )}
      {modal === 'mirror' && (
        <MirrorDialog
          onCancel={close}
          onSubmit={layout => {
            dispatch(updateMetadata({ layout }))
            close()
          }}
        />
      )}
    </div>
  )
}

function LayoutSwitcher () {
  const { selectedLayout } = useSelector(selectMetadata)
  const layouts = useSelector(selectLayoutNames)
  const dispatch = useDispatch()

  const switchLayout = useCallback(event => {
    const selectedLayout = event.target.value
    dispatch(changeSelectedLayout({ selectedLayout }))
  }, [dispatch])

  return layouts.length > 1 && (
    <select value={selectedLayout || ''} onChange={switchLayout}>
      {layouts.map((name, i) => (
        <option key={i} value={name}>
          {name}
        </option>
      ))}
    </select>
  )
}

function ReformatButton () {
  const dispatch = useDispatch()
  const triggerFormat = useCallback(() => (
    dispatch(formatText())
  ), [dispatch])

  return (
    <button onClick={triggerFormat}>
      Format
    </button>
  )
}

function MetadataButton () {
  const { parsed } = useSelector(selectMetadata)
  const dispatch = useDispatch()
  const triggerGenerate = useCallback(() => (
    dispatch(generateMetadata())
  ), [dispatch])

  return isRawLayout(parsed) && (
    <button onClick={triggerGenerate}>
      Generate metadata
    </button>
  )
}
