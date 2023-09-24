import { useCallback, useEffect, useMemo } from 'react'
import { validateInfoJson } from 'keymap-layout-tools/lib/validate'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'

import Importer from '../Importers/Importer.jsx'
import Reorder from '../Reorder/Reorder.jsx'
import useDarkModePreference from '../hooks/use-dark-mode-preference.js'
import { normalize, isRawLayout } from './util'
import useCodeReducer from './reducer.js'
import styles from './styles.module.css'

const jsonExtension = json()

export default function Code ({ value, onChange }) {
  const [{ modal, text, errors, parsed, selectedLayout }, dispatch] = useCodeReducer(value)
  const isDarkMode = useDarkModePreference()

  const layouts = isRawLayout(parsed) ? [] : Object.keys(parsed.layouts || {})
  const layout = useMemo(() => {
    if (!parsed) {
      return null
    }

    if (isRawLayout(parsed)) {
      return parsed
    }

    const defaultLayout = Object.keys(parsed.layouts || {})[0]
    return parsed.layouts[selectedLayout]?.layout || parsed.layouts[defaultLayout]?.layout
  }, [parsed, selectedLayout])

  const handleEdit = useCallback(text => {
    try {
      const parsed = JSON.parse(text)
      const metadata = normalize(parsed)

      validateInfoJson(metadata)

      dispatch({
        type: 'updated',
        payload: { parsed, text }
      })
    } catch (err) {
      dispatch({
        type: 'errored',
        payload: { text, err }
      })
    }
  }, [dispatch])

  useEffect(() => {
    const metadata = normalize(parsed)

    onChange(
      metadata.layouts[selectedLayout]?.layout ||
      Object.values(metadata.layouts)[0].layout
    )
  }, [parsed, selectedLayout, onChange])

  const handleFormat = useCallback(() => {
    dispatch({ type: 'reFormatted' })
  }, [dispatch])

  const handleGenerateMetadata = useCallback(() => {
    dispatch({ type: 'toMetadata' })
  }, [dispatch])

  const handleReorderedLayout = useCallback(layout => {
    dispatch({
      type: 'reOrdered',
      payload: { layout }
    })
  }, [dispatch])

  const handleSelectLayout = useCallback(event => {
    const selectedLayout = event.target.value
    dispatch({
      type: 'selectedLayout',
      payload: { selectedLayout }
    })
  }, [dispatch])

  return (
    <>
      {layout && modal === 'reorder' && (
        <Reorder
          layout={layout}
          onUpdate={handleReorderedLayout}
          onCancel={() => dispatch({ type: 'closedModal' })}
        />
      )}
      {modal === 'importer' && (
        <Importer
          onSubmit={layout => {
            dispatch({
              type: 'imported',
              payload: { layout }
            })
          }}
          onCancel={() => dispatch({ type: 'closedModal' })}
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
        <button onClick={() => dispatch({ type: 'openedModal', payload: { modal: 'reorder' } })}>Re-order</button>
        <button onClick={() => dispatch({ type: 'openedModal', payload: { modal: 'importer' } })}>
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
