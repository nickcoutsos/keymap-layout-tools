import { useCallback, useEffect, useMemo, useState } from 'react'
import { validateInfoJson, InfoValidationError } from 'keymap-layout-tools/lib/validate'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'

import Importer from '../Importers/Importer.jsx'
import Reorder from '../Reorder/Reorder.jsx'
import { formatMetadata, isRawLayout } from './util'
import styles from './styles.module.css'

const jsonExtension = json()
const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)')

function normalize (layoutOrMetadata) {
  return isRawLayout(layoutOrMetadata)
    ? { layouts: { default: { layout: layoutOrMetadata } } }
    : layoutOrMetadata
}

export default function Code ({ value, onChange }) {
  const [showImporterDialog, setShowImporterDialog] = useState(false)
  const [showReorderDialog, setShowReorderDialog] = useState(false)
  const [theme, setTheme] = useState(darkModePreference.matches ? 'dark' : 'light')
  const initialParse = useMemo(() => normalize(JSON.parse(value)), [value])
  const [{ text, errors, parsed, selectedLayout }, setState] = useState({
    text: value,
    errors: [],
    parsed: initialParse,
    selectedLayout: Object.keys(initialParse.layouts)[0]
  })

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

  useEffect(() => {
    const handleChange = e => {
      setTheme(e.matches ? 'dark' : 'light')
    }

    darkModePreference.addEventListener('change', handleChange)
    return () => darkModePreference.removeEventListener('change', handleChange)
  })

  const handleEdit = useCallback(text => {
    try {
      const parsed = JSON.parse(text)
      const metadata = normalize(parsed)
      const defaultLayout = Object.keys(metadata.layouts)[0]

      validateInfoJson(metadata)

      setState(state => ({
        ...state,
        text,
        errors: [],
        parsed,
        selectedLayout: state.selectedLayout in metadata.layouts ? state.selectedLayout : defaultLayout
      }))
    } catch (err) {
      const errors = err instanceof InfoValidationError
        ? err.errors
        : [err.toString()]

      setState(state => ({ ...state, text, errors }))
    }
  }, [setState])

  useEffect(() => {
    const metadata = normalize(parsed)

    onChange(
      metadata.layouts[selectedLayout]?.layout ||
      Object.values(metadata.layouts)[0].layout
    )
  }, [parsed, selectedLayout, onChange])

  const handleFormat = useCallback(() => {
    setState(state => ({ ...state, text: formatMetadata(state.parsed) }))
  }, [setState])

  const handleGenerateMetadata = useCallback(() => {
    setState(state => {
      if (!isRawLayout(state.parsed)) {
        return state
      }

      const parsed = {
        layouts: {
          default: {
            layout: state.parsed
          }
        }
      }

      return { ...state, parsed, text: formatMetadata(parsed) }
    })
  }, [setState])

  const handleReorderedLayout = useCallback(layout => {
    // TODO: handle updating specific layout in metadata collection
    setState(state => ({
      ...state,
      parsed: layout,
      selectedLayout: null,
      text: formatMetadata(layout)
    }))
    setShowReorderDialog(false)
  }, [setState, setShowReorderDialog])

  const handleSelectLayout = useCallback(event => {
    setState(state => ({ ...state, selectedLayout: event.target.value }))
  }, [setState])

  return (
    <>
      {layout && showReorderDialog && (
        <Reorder
          layout={layout}
          onUpdate={handleReorderedLayout}
          onCancel={() => setShowReorderDialog(false)}
        />
      )}
      {showImporterDialog && (
        <Importer
          onSubmit={layout => {
            setState(state => ({
              ...state,
              parsed: layout,
              selectedLayout: null,
              text: formatMetadata(layout)
            }))
            setShowImporterDialog(false)
          }}
          onCancel={() => setShowImporterDialog(false)}
        />
      )}
      <div className={styles.actions}>
        <button onClick={handleFormat}>Format</button>
        {isRawLayout(parsed) && (
          <button onClick={handleGenerateMetadata}>
            Generate metadata
          </button>
        )}
        <button onClick={() => setShowReorderDialog(true)}>Re-order</button>
        {layouts.length > 1 && (
          <select value={selectedLayout} onChange={handleSelectLayout}>
            {layouts.map((name, i) => (
              <option key={i} value={name}>{name}</option>
            ))}
          </select>
        )}
        <button onClick={() => setShowImporterDialog(true)}>
          Import...
        </button>
      </div>
      <CodeMirror
        value={text}
        style={{ overflow: 'auto' }}
        theme={theme}
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
