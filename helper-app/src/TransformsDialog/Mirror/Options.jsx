import { useCallback } from 'react'

export const DEFAULT_OPTIONS = {
  invert: false,
  gap: 2
}

export default function Options ({ options, onChange }) {
  const updateOption = useCallback((name, value) => {
    onChange({ ...options, [name]: value })
  }, [options, onChange])

  const handleChange = useCallback(event => {
    const name = event.target.name
    const value = event.target.type === 'checkbox'
      ? event.target.checked
      : (['number', 'range'].includes(event.target.type) ? Number(event.target.value) : event.target.value)

    updateOption(name, value)
  }, [updateOption])

  return (
    <>
      <div>
        <label>
          <input
            name="invert"
            type="checkbox"
            value={options.invert}
            onChange={handleChange}
          /> Flip horizontally before mirroring
        </label>
      </div>

      <div>
        <label>
          Gap between halves
          <input
            name="gap"
            type="range"
            min="0"
            max="10"
            step="1"
            value={options.gap}
            onChange={handleChange}
          />
        </label>
      </div>
    </>
  )
}
