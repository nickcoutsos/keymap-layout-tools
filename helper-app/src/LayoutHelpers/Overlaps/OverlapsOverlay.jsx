import uniq from 'lodash/uniq.js'
import { useMemo } from 'react'

import { getLayoutKeyPolygons } from 'keymap-layout-tools/lib/geometry.js'

import { polygonsIntersect } from '../../Common/DragSelector/util.js'
import Layout from '../../Common/Layout.jsx'
import Key from '../../Key.jsx'

export default function OverlapsOverlay ({ layout, scale }) {
  const overlappingKeys = useOverlappingKeys(layout)

  return (
    <div style={{ pointerEvents: 'none' }}>
      <Layout
        normalize={false}
        layout={overlappingKeys}
        scale={1}
        renderKey={() => (
          <Key style={{
            background: 'none',
            border: '2px dotted red'
          }} />
        )}
      />
    </div>
  )
}

// Comparing rectangular polygons means we only need to test two of each
// polygon's separating axes (we could cut that in half again if we could assert
// that both polygons are aligned to the same axes -- that is, neither rectangle
// is rotated, or both are rotated by the same amount)
// The threshold is given due to the fact that polygons are being calculated for
// keys with 0 separation, but in the visual rendering we are padding each key.
// Ideally this would be based on actual configuration, but for now the value is
// hardcoding the default key size and padding: 5px padding out of 70px width,
// times 2 (it's probably wrong to double it but honestly I'd rather miss some
// close calls than have any false positives).
const intersectTestOptions = {
  onlyRectangularPolys: true,
  threshold: 0.14
}

function useOverlappingKeys (layout) {
  const polygons = useMemo(() => getLayoutKeyPolygons(layout), [layout])
  return useMemo(() => {
    const indices = []
    for (let i = 0; i < layout.length - 1; i++) {
      for (let j = i + 1; j < layout.length; j++) {
        if (polygonsIntersect(polygons[i], polygons[j], intersectTestOptions)) {
          indices.push(i, j)
        }
      }
    }

    return uniq(indices).map(i => layout[i])
  }, [layout, polygons])
}
