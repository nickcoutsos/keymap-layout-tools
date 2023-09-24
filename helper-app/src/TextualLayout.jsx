import { useMemo } from 'react'
import renderLayout from 'keymap-layout-tools/lib/render'

export default function TextualLayout ({ layout }) {
  const labels = useMemo(() => layout.map((_, i) => i.toString()), [layout])
  return (
    <pre style={{ maxHeight: '15em', overflow: 'auto' }}>
      {(
        layout.every(key => 'row' in key && 'col' in key)
          ? renderLayout(layout, labels)
          : ' -- Missing `row`/`col` attributes from layout --'
      )}
    </pre>
  )
}
