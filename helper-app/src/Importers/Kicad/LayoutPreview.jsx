import { useMemo, useState } from 'react'

import { getKeyBoundingBox } from 'keymap-layout-tools/lib/geometry.js'

import Key from '../../Key.jsx'
import KeyPlacer from '../../KeyPlacer.jsx'

export default function LayoutPreview ({ metadata, scale = 0.4 }) {
  const layouts = Object.keys(metadata.layouts)
  const [selectedLayout, setSelectedLayout] = useState(layouts[0])

  const layout = useMemo(() => (
    metadata.layouts[selectedLayout]?.layout
  ), [metadata.layouts, selectedLayout])

  const wrapperStyle = useMemo(() => (
    layout && getWrapperStyle(layout, { scale })
  ), [layout, scale])

  return (
    <>
      {layouts.length > 1 && (
        <div>
          <label htmlFor="layout_selector">Layout:</label> <select
            id="layout_selector"
            value={selectedLayout}
            onChange={e => setSelectedLayout(e.target.value)}
          >
            {layouts.map((name, i) => (
              <option key={i} value={name}>{name}</option>
            ))}
          </select>
        </div>
      )}
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
    </>
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
    margin: '10px auto',
    ...overrides
  }
}
