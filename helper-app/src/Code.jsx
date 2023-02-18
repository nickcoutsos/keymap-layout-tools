import { useCallback, useState } from 'react'
import styles from './styles.module.css'

export default function Code ({ value, onChange }) {
  const [pending, setPending] = useState(value)
  const [error, setError] = useState(false)

  const handleChange = useCallback(event => {
    const { value } = event.target
    setPending(value)
    try {
      onChange(JSON.parse(value))
      setError(null)
    } catch (err) {
      setError(err)
    }
  }, [setPending, setError, onChange])

  return (
    <>
      <textarea
        value={pending}
        onChange={handleChange}
        cols={80}
        rows={20}
      />
      {error && (
        <p className={styles.error}>
          {error.toString()}
        </p>
      )}
    </>
  )
}
