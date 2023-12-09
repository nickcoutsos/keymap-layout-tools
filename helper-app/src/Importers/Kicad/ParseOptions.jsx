import { useCallback } from 'react'

import {
  DEFAULT_MODULE_PATTERN,
  DEFAULT_SWITCH_PATTERN
} from 'kicad-to-layout'

export const DEFAULT_OPTIONS = {
  invert: false,
  mirror: false,
  choc: false,
  inferKeySize: true,
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
        <label title="Interpret parsed switch positions using choc spacing">
          <input
            name="choc"
            type="checkbox"
            checked={options.choc}
            onChange={handleChange}
          /> Use Choc Spacing
        </label>
      </div>

      <div>
        <label title="Flip the parsed PCB layout">
          <input
            name="invert"
            type="checkbox"
            checked={options.invert}
            onChange={handleChange}
          /> Flip Horizontal
        </label>
      </div>

      <div>
        <label title="Mirror parsed PCB layout for a half-keyboard">
          <input
            name="mirror"
            type="checkbox"
            checked={options.mirror}
            onChange={handleChange}
          /> Mirror Horizontal
        </label>
      </div>

      <div>
        <label title="Attempt to parse keycap size units from switch descriptions">
          <input
            name="inferKeySize"
            type="checkbox"
            checked={options.inferKeySize}
            onChange={handleChange}
          /> Infer Key Size
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
        )} <Error value={getRegexError(options.modulePattern)} />
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
        )} <Error value={getRegexError(options.switchPattern)} />
      </div>
    </>
  )
}

function getRegexError (value) {
  try {
    return new RegExp(value) && false
  } catch (err) {
    return err
  }
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

function Error ({ value }) {
  if (!value) {
    return null
  }

  return (
    <span style={{
      backgroundColor: 'rgba(255, 0, 0, 0.2)',
      border: '2px solid crimson',
      borderRadius: '4px',
      color: 'crimson',
      padding: '2px'
    }}>
      Syntax error: {value.message || value.toString()}
    </span>
  )
}
