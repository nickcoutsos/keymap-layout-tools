import classNames from 'classnames'
import { useEffect, useState } from 'react'

import Layout from '../../Common/Layout.jsx'
import Key from '../../Key.jsx'

import Options, { DEFAULT_OPTIONS } from './Options.jsx'
import { useMirrorTransform } from './hooks'
import styles from './styles.module.css'

export default function Mirror ({ layout, onUpdate }) {
  const [options, setOptions] = useState(DEFAULT_OPTIONS)
  const { mirrored, mirroredWithMetadata } = useMirrorTransform(layout, options)

  useEffect(() => (
    onUpdate(mirrored)
  ), [mirrored, onUpdate])

  return (
    <div className={styles.mirrorDialog}>
      <h3>Options</h3>
      <fieldset>
        <Options options={options} onChange={setOptions} />
      </fieldset>

      <h3>Preview</h3>
      {mirroredWithMetadata && (
        <div style={{ width: '100%', overflow: 'auto' }}>
          <Layout
            layout={mirroredWithMetadata}
            scale={0.5}
            overrides={{ margin: '0 auto' }}
            renderKey={renderSwitch}
          />
        </div>
      )}
    </div>
  )
}

function renderSwitch ({ keyLayout, index }) {
  return (
    <Key
      index={index}
      keyLayout={keyLayout}
      className={classNames({
        [styles.mirroredKey]: keyLayout._duplicate
      })}
    />
  )
}
