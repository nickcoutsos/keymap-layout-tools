import { useCallback } from 'react'

export default function ParseOptions ({ options, onChange }) {
  const handleChange = useCallback(event => {
    const name = event.target.name
    const value = event.target.type === 'checkbox'
      ? event.target.checked
      : event.target.value

    onChange({ ...options, [name]: value })
  }, [options, onChange])

  return (
    <>
      <div>
        <label>
          <input
            name="choc"
            type="checkbox"
            value={options.choc}
            onChange={handleChange}
          /> Use Choc Spacing
        </label>
      </div>

      <div>
        <label>
          <input
            name="invert"
            type="checkbox"
            value={options.invert}
            onChange={handleChange}
          /> Flip Horizontal
        </label>
      </div>

      <div>
        <label>
          <input
            name="mirror"
            type="checkbox"
            value={options.mirror}
            onChange={handleChange}
          /> Mirror Horizontal
        </label>
      </div>
      <div>
        <label>
          Module pattern: <input
            name="pattern"
            type="text"
            value={options.pattern}
            onChange={handleChange}
          />
        </label>
      </div>
    </>
  )
}
