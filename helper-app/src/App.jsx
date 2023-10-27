import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import './App.css'
import Actions from './Actions.jsx'
import Code from './Code/Code.jsx'
import KeyboardLayout from './KeyboardLayout.jsx'
import TextualLayout from './TextualLayout.jsx'
import Key from './Key.jsx'
import corneLayout from './corne-layout.json'

import styles from './styles.module.css'
import { selectLayout, updateMetadata } from './metadataSlice'

function App () {
  const layout = useSelector(selectLayout)
  const [scale, setScale] = useState(0.7)

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
    <>
      <Actions />
      <div className={styles.container}>
        <div className={styles.code}>
          <Code />
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
          <KeyboardLayout
            layout={layout}
            renderKey={Key}
            scale={scale}
          />
        </div>
      </div>
    </>
  )
}

function withInitializedState (Component) {
  return function () {
    const layout = useSelector(selectLayout)
    const dispatch = useDispatch()
    useEffect(() => {
      dispatch(updateMetadata({
        metadata: corneLayout
      }))
    }, [dispatch])

    if (!layout) {
      return null
    }

    return <Component />
  }
}

export default withInitializedState(App)
