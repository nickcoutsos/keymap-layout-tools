import { useMemo, useState } from 'react'

import { getKeyBoundingBox } from 'keymap-layout-tools/lib/geometry'
import renderLayout from 'keymap-layout-tools/lib/render'

import './App.css'
import Code from './Code.jsx'
import KeyboardLayout from './KeyboardLayout.jsx'
import Key from './Key.jsx'
import corneLayout from './corne-layout.json'
import styles from './styles.module.css'

function serialize (layout) {
  const lines = layout.map(line => '  ' + JSON.stringify(line))
  return `[\n${lines.join(',\n')}]`
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
    padding: '0 40px 40px',
    ...overrides
  }
}

export default function App () {
  const [layout, setLayout] = useState(corneLayout)
  const wrapperStyle = useMemo(() => getWrapperStyle(layout), [layout])
  const labels = useMemo(() => layout.map((_, i) => i.toString()), [layout])

  return (
    <div className={styles.container}>
      <div className={styles.code}>
        <h2>Layout</h2>
        <Code
          value={serialize(layout)}
          onChange={setLayout}
        />
      </div>

      <div className={styles.previews}>
        <h2>Text Rendering</h2>
        <p>
          <em>
            Your keymap will be code will be rendered in this format. It is
            generated using the <code>col</code> and <code>row</code> properties
            and the key ordering of your layout.
          </em>
        </p>
        <pre>{renderLayout(layout, labels)}</pre>

        <h2>Graphical Rendering</h2>
        <p>
          <em>
            Applications will visualize your keymap in this format. It is layed
            out using the positon, rotation, and size properties of your layout.
          </em>
        </p>
        <div style={wrapperStyle}>
          <KeyboardLayout
            layout={layout}
            renderKey={Key}
          />
        </div>
      </div>
    </div>
  )
}
