import { useMemo } from 'react'

import { getLayoutBoundingRect } from 'keymap-layout-tools/lib/geometry.js'

import Key from '../Key.jsx'
import KeyPlacer from '../KeyPlacer.jsx'

export default function Layout ({ layout, scale = 0.4, overrides = {}, renderKey = defaultRenderKey }) {
  const wrapperStyle = useMemo(() => (
    layout && getWrapperStyle(layout, { scale, overrides })
  ), [layout, scale, overrides])

  return (
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
    ...overrides
  }
}
