import classNames from 'classnames'
import { useEffect, useState, useMemo } from 'react'

import { useKicadImporter } from './hooks.js'
import ParseOptions, { DEFAULT_OPTIONS } from './ParseOptions.jsx'
import styles from './styles.module.css'

import FileSelect from '../../Common/FileSelect.jsx'
import Layout from '../../Common/Layout.jsx'
import Key from '../../Key.jsx'

export default function KicadImporter ({ onUpdate }) {
  const [contents, setContents] = useState('')
  const [options, setOptions] = useState(DEFAULT_OPTIONS)

  const { switches, layout: previewLayout, components } = useKicadImporter(contents, options)
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
      <SwitchCandidates components={components} />
      {previewLayout && (
        <Layout
          layout={layoutWithSwitchInfo}
          scale={0.5}
          overrides={{ margin: '0 auto' }}
          renderKey={renderSwitch}
        />
      )}
    </>
  )
}

function SwitchCandidates ({ components }) {
  if (!components) {
    return
  }

  const matched = components.filter(component => component.match).length
  const total = components.length

  return (
    <details className={styles.components}>
      <summary>Loaded components ({matched} / {total})</summary>

      <table>
        <thead>
          <tr>
            <th>Module</th>
            <th>Reference</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {components.map((component, i) => (
            <tr
              key={i}
              className={classNames({
                [styles.componentMatch]: component.match
              })}
            >
              <td>{component.name}</td>
              <td>{component.ref}</td>
              <td>{component.description || <em>(none)</em>}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>
        <em>
          Modules/footprints parsed from PCB. Pattern mismatches are indicated
          by a strikethrough.
        </em>
      </p>
    </details>
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
