import cloneDeep from 'lodash/cloneDeep.js'
import { useMemo } from 'react'

import { getLayoutBoundingRect } from 'keymap-layout-tools/lib/geometry.js'
import { toOrigin } from 'keymap-layout-tools/lib/modifiers.js'

import Key from '../Key.jsx'
import KeyPlacer from '../KeyPlacer.jsx'

export default function Layout ({ layout: original, scale, normalize, overrides, renderKey, renderOverlay }) {
  const layout = useMemo(() => (
    original && (
      normalize
        ? toOrigin(original)
        : cloneDeep(original)
    )
  ), [normalize, original])

  const wrapperStyle = useMemo(() => (
    layout && getWrapperStyle(layout, { scale, overrides })
  ), [layout, scale, overrides])

  // TODO: Passing layout (normalized) and original into `renderOverlay()` is
  // sloppy but I can't deal with it right now. The `layout` param is necessary
  // to render overlays on a potentially-normalized layout rendering and the
  // `original` param is necessary when computing something with layout data.

  return (
    <div style={wrapperStyle}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}>
        {layout.map((keyLayout, index) => (
          <KeyPlacer key={index} keyLayout={keyLayout}>
            {renderKey({ index, keyLayout })}
          </KeyPlacer>
        ))}
        {renderOverlay(layout, original)}
      </div>
    </div>
  )
}

Layout.defaultProps = {
  scale: 0.4,
  normalize: true,
  overrides: {},
  renderKey: defaultRenderKey,
  renderOverlay: defaultRenderOverlay
}

function defaultRenderKey (props) {
  return <Key {...props} />
}

function defaultRenderOverlay () {
  return null
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
