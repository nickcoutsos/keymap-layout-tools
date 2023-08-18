import cloneDeep from 'lodash/cloneDeep.js'
import { useEffect, useState, useMemo } from 'react'

import * as kicad from 'kicad-to-layout'

import ParseOptions from './ParseOptions.jsx'

import FileSelect from '../../Common/FileSelect.jsx'
import LayoutPreview from '../../Common/LayoutPreview.jsx'

export default function KicadImporter ({ onUpdate }) {
  const [contents, setContents] = useState('')
  const [options, setOptions] = useState({
    invertX: false,
    mirrorX: false,
    choc: false,
    pattern: '.*'
  })

  const baseLayout = useMemo(() => {
    if (!contents) {
      return null
    }

    return kicad.parseKicadLayout(contents, {
      modulePattern: options.pattern,
      spacing: (
        options.choc
          ? { x: 18.5, y: 17.5 }
          : { x: 19, y: 19 }
      )
    })
  }, [contents, options.choc, options.pattern])

  const layout = useMemo(() => {
    if (!baseLayout) {
      return null
    }

    let layout = cloneDeep(baseLayout)
    if (options.invertX) {
      layout = kicad.flip(layout)
    }
    if (options.mirrorX) {
      layout = kicad.mirror(layout)
    }

    for (const key of layout) {
      if (key.r) {
        key.rx = key.x + 0.5
        key.ry = key.y + 0.5
      }
    }

    for (const layoutKey of layout) {
      for (const prop in layoutKey) {
        const value = layoutKey[prop]
        if (typeof value === 'number' && Math.round(value) !== value) {
          layoutKey[prop] = Number(value.toFixed(2))
        }
      }
    }

    return layout
  }, [baseLayout, options.invertX, options.mirrorX])

  const metadata = useMemo(() => layout && ({
    layouts: {
      LAYOUT: {
        layout
      }
    }
  }), [layout])

  useEffect(() => {
    onUpdate(metadata)
  }, [metadata, onUpdate])

  const optionsStyle = !contents
    ? { opacity: 0.5 }
    : {}

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
      <fieldset disabled={!contents} style={optionsStyle}>
        <ParseOptions options={options} onChange={setOptions} />
      </fieldset>

      <h3>3. Preview</h3>
      {metadata && <LayoutPreview metadata={metadata} />}
    </>
  )
}
