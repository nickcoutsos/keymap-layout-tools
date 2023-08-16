import { useCallback, useEffect, useState } from 'react'
import { validateInfoJson, InfoValidationError } from 'keymap-layout-tools/lib/validate'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'

import Importer from '../Importers/Importer.jsx'
import {
  formatMetadata,
  isKleLayout,
  isRawLayout,
  parseKleLayout
} from './util'
import styles from './styles.module.css'

const jsonExtension = json()
const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)')

export default function Code ({ value, onChange }) {
  const [importer, setImporter] = useState(null)
  const [theme, setTheme] = useState(darkModePreference.matches ? 'dark' : 'light')
  const [{ text, errors, parsed, selectedLayout, kle }, setState] = useState({
    text: value,
    errors: [],
    parsed: JSON.parse(value),
    selectedLayout: ''
  })

  const layouts = isRawLayout(parsed) ? [] : Object.keys(parsed.layouts || {})

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
      const kle = isKleLayout(parsed)

      if (kle) {
        setState(state => ({ ...state, text, errors: [], kle: true }))
        return
      }

      const metadata = isRawLayout(parsed)
        ? { layouts: { default: { layout: parsed } } }
        : parsed

      validateInfoJson(metadata)

      setState(state => ({
        ...state,
        text,
        errors: [],
        parsed
      }))
    } catch (err) {
      const errors = err instanceof InfoValidationError
        ? err.errors
        : [err.toString()]

      setState(state => ({ ...state, text, errors }))
    }
  }, [setState])

  useEffect(() => {
    const metadata = isRawLayout(parsed)
      ? { layouts: { default: { layout: parsed } } }
      : parsed

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

  const handleSelectLayout = useCallback(event => {
    setState(state => ({ ...state, selectedLayout: event.target.value }))
  }, [setState])

  const handleImportKle = useCallback(() => {
    setState(state => {
      const parsed = parseKleLayout(JSON.parse(state.text))
      const text = formatMetadata(parsed)
      return { ...state, parsed, text, kle: false }
    })
  }, [setState])

  return (
    <>
      {importer && (
        <Importer
          type={importer}
          onSubmit={layout => {
            setState(state => ({
              ...state,
              parsed: layout,
              text: formatMetadata(layout)
            }))
            setImporter(null)
          }}
          onCancel={() => setImporter(null)}
        />
      )}
      <div className={styles.actions}>
        <button onClick={handleFormat}>Format</button>
        {isRawLayout(parsed) && (
          <button onClick={handleGenerateMetadata}>
            Generate metadata
          </button>
        )}
        {layouts.length > 1 && (
          <select value={selectedLayout} onChange={handleSelectLayout}>
            {layouts.map((name, i) => (
              <option key={i} value={name}>{name}</option>
            ))}
          </select>
        )}
        <button onClick={() => setImporter('kicad')}>Import from Kicad PCB</button>
        {kle && (
          <button onClick={handleImportKle} className={styles.kleImport}>
            Import KLE Layout
          </button>
        )}
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
          <ul>
            {errors.map((error, i) => (
              <li key={i}>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
