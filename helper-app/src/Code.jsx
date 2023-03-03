import { useCallback, useEffect, useState } from 'react'
import { validateInfoJson, InfoValidationError } from 'keymap-layout-tools/lib/validate'

import { formatJson, jsonTable } from './formatter'
import styles from './styles.module.css'

function formatMetadata (metadata) {
  return formatJson(metadata, [{
    match: (key, value) => Array.isArray(value),
    serialize: value => jsonTable(value)
  }], 2)
}

function isRawLayout (data) {
  return Array.isArray(data)
}

export default function Code ({ value, onChange }) {
  const [{ text, errors, parsed, selectedLayout }, setState] = useState({
    text: value,
    errors: [],
    parsed: JSON.parse(value),
    selectedLayout: ''
  })

  const layouts = isRawLayout(parsed) ? [] : Object.keys(parsed.layouts)

  const handleEdit = useCallback(event => {
    const { value } = event.target

    try {
      const parsed = JSON.parse(value)
      const metadata = isRawLayout(parsed)
        ? { layouts: { default: { layout: parsed } } }
        : parsed

      validateInfoJson(metadata)

      setState(state => ({
        ...state,
        text: value,
        errors: [],
        parsed
      }))
    } catch (err) {
      const errors = err instanceof InfoValidationError
        ? err.errors
        : [err.toString()]

      setState(state => ({ ...state, text: value, errors }))
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

  return (
    <>
      <p style={{ display: 'flex', gap: '4px' }}>
        <button onClick={handleFormat}>Format</button>
        {isRawLayout(parsed) && <button onClick={handleGenerateMetadata}>Generate metadata</button>}
        {layouts.length > 1 && (
          <select value={selectedLayout} onChange={handleSelectLayout}>
            {layouts.map((name, i) => (
              <option key={i} value={name}>{name}</option>
            ))}
          </select>
        )}
      </p>
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