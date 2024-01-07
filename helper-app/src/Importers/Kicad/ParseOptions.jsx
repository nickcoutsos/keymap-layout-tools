import { useCallback } from 'react'

import {
  DEFAULT_MODULE_PATTERN,
  DEFAULT_SWITCH_PATTERN
} from 'kicad-to-layout'

export const DEFAULT_OPTIONS = {
  invert: false,
  mirror: false,
  mirrorGap: 1,
  inferKeySize: true,
  modulePattern: DEFAULT_MODULE_PATTERN,
  switchPattern: DEFAULT_SWITCH_PATTERN,
  switchSpacing: 'mx',
  customSpacingX: 19,
  customSpacingY: 19
}

export default function ParseOptions ({ options, onChange }) {
  const updateOption = useCallback((name, value) => {
    onChange({ ...options, [name]: value })
  }, [options, onChange])

  const handleChange = useCallback(event => {
    const name = event.target.name
    let value = event.target.type === 'checkbox'
      ? event.target.checked
      : event.target.value

    if (event.target.type === 'number') {
      value = Number(value)
    }

    updateOption(name, value)
  }, [updateOption])

  return (
    <>
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

      {options.mirror && (
        <div>
          <label
            title="Width of blank space (in key units) to leave between keyboard halves"
            style={{ marginLeft: '25px' }}
          >
            Mirror gap <input
              style={{ verticalAlign: 'middle' }}
              name="mirrorGap"
              type="range"
              min="0"
              max="5"
              step="1"
              value={options.mirrorGap}
              checked={options.mirrorGap}
              onChange={event => updateOption(
                'mirrorGap',
                Number(event.target.value)
              )}
            />
          </label>
        </div>
      )}

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

      <div>
        <label>
          Switch spacing:
        </label>
        <ul>
          <li>
            <label>
              <input
                name="switchSpacing"
                type="radio"
                value="choc"
                checked={options.switchSpacing === 'choc'}
                onChange={handleChange}
              /> Choc (<em>18mm</em> ⨯ <em>17mm</em>)
            </label>
          </li>
          <li>
            <label>
              <input
                name="switchSpacing"
                type="radio"
                value="mx"
                checked={options.switchSpacing === 'mx'}
                onChange={handleChange}
              /> MX (<em>19mm</em> ⨯ <em>19mm</em>)
            </label>
          </li>
          <li>
            <label>
              <input
                name="switchSpacing"
                type="radio"
                value="custom"
                checked={options.switchSpacing === 'custom'}
                onChange={handleChange}
              /> Custom...
            </label>
            <fieldset disabled={options.switchSpacing !== 'custom'}>
              <input
                name="customSpacingX"
                type="number"
                min={0.1}
                title="Horizontal spacing in millimeters"
                style={{ width: '50px' }}
                value={options.customSpacingX}
                onChange={handleChange}
              /> mm ⨯ <input
                name="customSpacingY"
                type="number"
                min={0.1}
                title="Vertical spacing in millimeters"
                style={{ width: '50px' }}
                value={options.customSpacingY}
                onChange={handleChange}
              /> mm
            </fieldset>
          </li>
        </ul>
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
