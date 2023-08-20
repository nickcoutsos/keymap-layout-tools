import { useMemo, useState } from 'react'

import { getLayoutBoundingRect } from 'keymap-layout-tools/lib/geometry.js'

import Key from '../Key.jsx'
import KeyPlacer from '../KeyPlacer.jsx'

export default function LayoutPreview ({ metadata, scale = 0.4, renderKey = defaultRenderKey }) {
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
                {renderKey({ index, keyLayout })}
              </KeyPlacer>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

function defaultRenderKey (props) {
  return <Key {...props} />
}

function getWrapperStyle (layout, { scale = 1, overrides = {} } = {}) {
  const bbox = getLayoutBoundingRect(layout)
  const width = bbox.max.x - bbox.min.x
  const height = bbox.max.y - bbox.min.y

  return {
    width: `${width * scale}px`,
    height: `${height * scale}px`,
    margin: '10px auto',
    ...overrides
  }
}
