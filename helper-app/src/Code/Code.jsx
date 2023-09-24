import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'

import Importer from '../Importers/Importer.jsx'
import Reorder from '../Reorder/Reorder.jsx'
import useDarkModePreference from '../hooks/use-dark-mode-preference.js'
import { isRawLayout } from './util'
import styles from './styles.module.css'
import {
  updateFromText,
  updateFromParsed,
  formatText,
  generateMetadata,
  selectMetadata,
  changeSelectedLayout,
  selectLayout
} from '../metadataSlice.js'

const jsonExtension = json()

export default function Code () {
  const [modal, setModal] = useState(null)
  const { text, errors, parsed, selectedLayout } = useSelector(selectMetadata)
  const dispatch = useDispatch()
  const isDarkMode = useDarkModePreference()

  const layouts = isRawLayout(parsed) ? [] : Object.keys(parsed.layouts || {})
  const layout = useSelector(selectLayout)

  const handleEdit = useCallback(text => {
    dispatch(updateFromText({ text }))
  }, [dispatch])

  const handleFormat = useCallback(() => {
    dispatch(formatText())
  }, [dispatch])

  const handleGenerateMetadata = useCallback(() => {
    dispatch(generateMetadata())
  }, [dispatch])

  const handleSelectLayout = useCallback(event => {
    const selectedLayout = event.target.value
    dispatch(changeSelectedLayout({ selectedLayout }))
  }, [dispatch])

  return (
    <>
      {layout && modal === 'reorder' && (
        <Reorder
          layout={layout}
          onUpdate={layout => {
            dispatch(updateFromParsed({ layout }))
            setModal(null)
          }}
          onCancel={() => setModal(null)}
        />
      )}
      {modal === 'importer' && (
        <Importer
          onSubmit={metadata => {
            dispatch(updateFromParsed({ metadata }))
            setModal(null)
          }}
          onCancel={() => setModal(null)}
        />
      )}
      <div className={styles.actions}>
        {layouts.length > 1 && (
          <select value={selectedLayout} onChange={handleSelectLayout}>
            {layouts.map((name, i) => (
              <option key={i} value={name}>{name}</option>
            ))}
          </select>
        )}
        <button onClick={handleFormat}>Format</button>
        {isRawLayout(parsed) && (
          <button onClick={handleGenerateMetadata}>
            Generate metadata
          </button>
        )}
        <button onClick={() => setModal('reorder')}>Re-order</button>
        <button onClick={() => setModal('importer')}>
          Import...
        </button>
      </div>
      <CodeMirror
        value={text}
        style={{ overflow: 'auto' }}
        theme={isDarkMode ? 'dark' : 'light'}
        width="460px"
        onChange={handleEdit}
        extensions={[jsonExtension]}
      />
      {errors.length > 0 && (
        <div className={styles.error}>
          <ol>
            {errors.map((error, i) => (
              <li key={i}>
                {error}
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  )
}
