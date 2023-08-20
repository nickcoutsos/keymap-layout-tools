import { useCallback } from 'react'

import {
  DEFAULT_MODULE_PATTERN,
  DEFAULT_SWITCH_PATTERN
} from 'kicad-to-layout'

export const DEFAULT_OPTIONS = {
  invert: false,
  mirror: false,
  choc: false,
  modulePattern: DEFAULT_MODULE_PATTERN,
  switchPattern: DEFAULT_SWITCH_PATTERN
}

export default function ParseOptions ({ options, onChange }) {
  const updateOption = useCallback((name, value) => {
    onChange({ ...options, [name]: value })
  }, [options, onChange])

  const handleChange = useCallback(event => {
    const name = event.target.name
    const value = event.target.type === 'checkbox'
      ? event.target.checked
      : event.target.value

    updateOption(name, value)
  }, [updateOption])

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
            name="modulePattern"
            type="text"
            value={options.modulePattern}
            onChange={handleChange}
          />
        </label> {options.modulePattern !== DEFAULT_MODULE_PATTERN && (
          <RevertToDefaultButton
            name='modulePattern'
            defaultValue={DEFAULT_MODULE_PATTERN}
            onUpdate={updateOption}
          />
        )}
      </div>
      <div>
        <label>
          Switch pattern: <input
            name="switchPattern"
            type="text"
            value={options.switchPattern}
            onChange={handleChange}
          />
        </label> {options.switchPattern !== DEFAULT_SWITCH_PATTERN && (
          <RevertToDefaultButton
            name='switchPattern'
            defaultValue={DEFAULT_SWITCH_PATTERN}
            onUpdate={updateOption}
          />
        )}
      </div>
    </>
  )
}

function RevertToDefaultButton ({ name, defaultValue, onUpdate }) {
  const title = `Revert to "${defaultValue}"`
  const handleClick = useCallback(() => {
    onUpdate(name, defaultValue)
  }, [name, defaultValue, onUpdate])

  return (
    <button title={title} onClick={handleClick}>
      ⎌ Revert
    </button>
  )
}
