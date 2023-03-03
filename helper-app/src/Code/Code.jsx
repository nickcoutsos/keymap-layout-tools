import { useCallback, useEffect, useState } from 'react'
import { validateInfoJson, InfoValidationError } from 'keymap-layout-tools/lib/validate'

import {
  formatMetadata,
  isKleLayout,
  isRawLayout,
  parseKleLayout
} from './util'
import styles from './styles.module.css'

export default function Code ({ value, onChange }) {
  const [{ text, errors, parsed, selectedLayout, kle }, setState] = useState({
    text: value,
    errors: [],
    parsed: JSON.parse(value),
    selectedLayout: ''
  })

  const layouts = isRawLayout(parsed) ? [] : Object.keys(parsed.layouts || {})

  const handleEdit = useCallback(event => {
    const { value: text } = event.target

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
        {kle && (
          <button onClick={handleImportKle} className={styles.kleImport}>
            Import KLE Layout
          </button>
        )}
      </div>
      <textarea
        value={text}
        onChange={handleEdit}
        cols={60}
        rows={30}
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
