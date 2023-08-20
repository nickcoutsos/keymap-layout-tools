import { useEffect, useState, useMemo } from 'react'

import { useKicadImporter } from './hooks.js'
import ParseOptions from './ParseOptions.jsx'
import styles from './styles.module.css'

import FileSelect from '../../Common/FileSelect.jsx'
import Layout from '../../Common/Layout.jsx'
import Key from '../../Key.jsx'

export default function KicadImporter ({ onUpdate }) {
  const [contents, setContents] = useState('')
  const [options, setOptions] = useState({
    invert: false,
    mirror: false,
    choc: false,
    pattern: '.*'
  })

  const { switches, layout: previewLayout } = useKicadImporter(contents, options)
  const layoutWithSwitchInfo = useMemo(() => {
    return previewLayout && previewLayout.map((key, i) => ({
      ...key,
      _switch: (
        '_original' in key
          ? switches[key._original]
          : switches[i]
      )
    }))
  }, [previewLayout, switches])

  const layout = useMemo(() => previewLayout && previewLayout.map(key => {
    const cleaned = { ...key }
    delete cleaned._original
    return cleaned
  }), [previewLayout])

  useEffect(() => {
    onUpdate({
      layouts: {
        LAYOUT: {
          layout
        }
      }
    })
  }, [layout, onUpdate])

  return (
    <>
      <h3>1. Select file</h3>
      <div>
        <FileSelect
          onChange={({ contents }) => setContents(contents)}
          accept=".kicad_pcb"
        />
      </div>

      <h3>2. Options</h3>
      <fieldset disabled={!contents}>
        <ParseOptions options={options} onChange={setOptions} />
      </fieldset>

      <h3>3. Preview</h3>
      {previewLayout && previewLayout.length === 0 && (
        <div className={styles.warning}>
          ⚠️ No switches could be parsed
        </div>
      )}
      {previewLayout && (
        <Layout
          layout={layoutWithSwitchInfo}
          overrides={{ margin: '0 auto' }}
          renderKey={renderSwitch}
        />
      )}
    </>
  )
}

function renderSwitch ({ keyLayout }) {
  return (
    <Key
      index={keyLayout._switch?.name}
      keyLayout={keyLayout}
      title={[
        `Module/footprint label: "${keyLayout._switch?.mod}"`,
        `Switch label: "${keyLayout._switch?.name}"`
      ].join('\n')}
    />
  )
}
