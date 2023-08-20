import { useMemo, useState } from 'react'

import Layout from './Layout.jsx'

const overrides = {
  margin: '10px auto'
}

export default function LayoutPreview ({ metadata, ...props }) {
  const layouts = Object.keys(metadata.layouts)
  const [selectedLayout, setSelectedLayout] = useState(layouts[0])

  const layout = useMemo(() => (
    metadata.layouts[selectedLayout]?.layout
  ), [metadata.layouts, selectedLayout])

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
        <Layout
          layout={layout}
          overrides={overrides}
          {...props}
        />
      )}
    </>
  )
}
