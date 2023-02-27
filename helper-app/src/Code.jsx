import { useCallback, useState } from 'react'
import { validateInfoJson, InfoValidationError } from 'keymap-layout-tools/lib/validate'

import styles from './styles.module.css'

export default function Code ({ value, onChange }) {
  const [pending, setPending] = useState(value)
  const [errors, setErrors] = useState(false)

  const handleChange = useCallback(event => {
    const { value } = event.target
    setPending(value)
    try {
      const layout = JSON.parse(value)
      const metadata = Array.isArray(layout)
        ? { layouts: { default: { layout } } }
        : layout

      validateInfoJson(metadata)
      onChange(layout)
      setErrors(null)
    } catch (err) {
      setErrors(
        err instanceof InfoValidationError
          ? err.errors
          : [err.toString()]
      )
    }
  }, [setPending, setErrors, onChange])

  return (
    <>
      <textarea
        value={pending}
        onChange={handleChange}
        cols={80}
        rows={20}
      />
      {errors && (
        <p className={styles.error}>
          <ul>
            {errors.map((error, i) => (
              <li key={i}>
                {error}
              </li>
            ))}
          </ul>
        </p>
      )}
    </>
  )
}
