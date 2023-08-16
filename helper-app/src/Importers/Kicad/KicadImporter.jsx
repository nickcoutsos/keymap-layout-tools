import cloneDeep from 'lodash/cloneDeep.js'
import { useState, useMemo } from 'react'

import { getKeyBoundingBox } from 'keymap-layout-tools/lib/geometry'
import * as kicad from 'kicad-to-layout'

import FileSelect from './FileSelect.jsx'
import ParseOptions from './ParseOptions.jsx'

import Key from '../../Key.jsx'
import KeyPlacer from '../../KeyPlacer.jsx'
import Modal from '../../Modal.jsx'

const style = {
  backgroundColor: 'var(--bg)',
  padding: '10px 20px',
  minWidth: '500px',
  width: 'fit-content',
  maxWidth: '700px',
  maxHeight: '90vh',
  overflow: 'auto',
  boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.4)',
  borderRadius: '3px',
  border: '0.25px solid rgba(0, 0, 0, 0.4)'
}

const scale = 0.4

export default function KicadImporter ({ onSubmit, onCancel }) {
  const [contents, setContents] = useState('')
  const [options, setOptions] = useState({
    invertX: false,
    mirrorX: false,
    choc: false,
    pattern: '.*'
  })

  const baseLayout = useMemo(() => {
    if (!contents) {
      return null
    }

    return kicad.parseKicadLayout(contents, {
      modulePattern: options.pattern,
      spacing: (
        options.choc
          ? { x: 18.5, y: 17.5 }
          : { x: 19, y: 19 }
      )
    })
  }, [contents, options.choc, options.pattern])

  const layout = useMemo(() => {
    if (!baseLayout) {
      return null
    }

    let layout = cloneDeep(baseLayout)
    if (options.invertX) {
      layout = kicad.flip(layout)
    }
    if (options.mirrorX) {
      layout = kicad.mirror(layout)
    }

    for (const key of layout) {
      if (key.r) {
        key.rx = key.x + 0.5
        key.ry = key.y + 0.5
      }
    }

    for (const layoutKey of layout) {
      for (const prop in layoutKey) {
        const value = layoutKey[prop]
        if (typeof value === 'number' && Math.round(value) !== value) {
          layoutKey[prop] = Number(value.toFixed(2))
        }
      }
    }

    return layout
  }, [baseLayout, options.invertX, options.mirrorX])

  const wrapperStyle = useMemo(() => layout && getWrapperStyle(layout, { scale }), [layout])
  const optionsStyle = !contents
    ? { opacity: 0.5 }
    : {}

  return (
    <Modal onCancel={onCancel}>
      <div style={style}>
        <h2>Import Kicad PCB</h2>

        <p>
          <em>
            Note: Kicad PCBs are great for parsing switch position and rotation
            details but they are often not ordered the same way they'd be used
            in keymap bindings. Depending on the PCB may require some manual
            sorting, especially for the <code>row</code>/<code>col</code>
            properties.
          </em>
        </p>
        <p>
          <em>This is still in progress.</em>
        </p>

        <h3>1. Select file</h3>
        <div>
          <FileSelect
            onChange={({ contents }) => setContents(contents)}
          />
        </div>

        <h3>2. Options</h3>
        <fieldset disabled={!contents} style={optionsStyle}>
          <ParseOptions options={options} onChange={setOptions} />
        </fieldset>

        <h3>3. Preview</h3>
        {layout && (
          <div style={wrapperStyle}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}>
              {layout.map((keyLayout, index) => (
                <KeyPlacer
                  key={index}
                  keyLayout={keyLayout}
                >
                  <Key index={index} keyLayout={keyLayout} />
                </KeyPlacer>
              ))}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', margin: '15px 0 5px' }}>
          <button disabled={!layout} onClick={() => onSubmit(layout)}>Accept</button>
          <button style={{ background: 'none', border: 'none' }} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </Modal>
  )
}

function getWrapperStyle (layout, { scale = 1, overrides = {} } = {}) {
  const bbox = layout.map(key => getKeyBoundingBox(
    { x: key.x, y: key.y },
    { u: key.u || key.w || 1, h: key.h || 1 },
    { x: key.rx, y: key.ry, a: key.r }
  )).reduce(({ x, y }, { max }) => ({
    x: Math.max(x, max.x),
    y: Math.max(y, max.y)
  }), { x: 0, y: 0 })

  return {
    width: `${bbox.x * scale}px`,
    height: `${bbox.y * scale}px`,
    margin: '0 auto',
    ...overrides
  }
}
