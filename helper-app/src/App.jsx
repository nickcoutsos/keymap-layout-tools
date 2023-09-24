import { useMemo, useState } from 'react'

import { getLayoutBoundingRect } from 'keymap-layout-tools/lib/geometry'

import './App.css'
import Code from './Code/Code.jsx'
import KeyboardLayout from './KeyboardLayout.jsx'
import TextualLayout from './TextualLayout.jsx'
import Key from './Key.jsx'
import corneLayout from './corne-layout.json'
import styles from './styles.module.css'

function serialize (layout) {
  const lines = layout.map(line => '  ' + JSON.stringify(line))
  return `[\n${lines.join(',\n')}\n]`
}

function getWrapperStyle (layout, { scale = 1, overrides = {} } = {}) {
  const bbox = getLayoutBoundingRect(layout)
  const width = bbox.max.x - bbox.min.x
  const height = bbox.max.y - bbox.min.y

  return {
    width: `${width * scale}px`,
    height: `${height * scale}px`,
    margin: '0 auto',
    ...overrides
  }
}

export default function App () {
  const [layout, setLayout] = useState(corneLayout)
  const [scale, setScale] = useState(0.7)
  const wrapperStyle = useMemo(
    () => getWrapperStyle(layout, { scale }),
    [layout, scale]
  )

  const zoom = (
    <input
      type="range"
      onChange={e => setScale(Number(e.target.value))}
      value={scale}
      min="0.2"
      max="1.5"
      step="0.1"
    />
  )

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
        <TextualLayout layout={layout} />

        <h2>
          Graphical Rendering <span className={styles.zoom}>(Zoom: {scale.toFixed(1)}x {zoom})</span>
        </h2>
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
            scale={scale}
          />
        </div>
      </div>
    </div>
  )
}
