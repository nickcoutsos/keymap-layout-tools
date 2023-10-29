import { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'

import {
  bboxUnion,
  getKeyBoundingBox,
  getPositionSizeRotation
} from 'keymap-layout-tools/lib/geometry.js'

import Axes from './Axes.jsx'
import KeyPlacer from '../../KeyPlacer.jsx'
import Key from '../../Key.jsx'
import { updateMetadata } from '../../metadataSlice.js'

function TranslationHelper ({ layout, scale, keyIndices }) {
  const [dragOffset, setDragOffset] = useState([0, 0])
  const dispatch = useDispatch()

  const keys = keyIndices.map(i => layout[i])
  const bbox = keys.map(key => (
    getKeyBoundingBox(...getPositionSizeRotation(key))
  )).reduce(bboxUnion)

  const center = {
    x: (bbox.max.x + bbox.min.x) / 2,
    y: (bbox.max.y + bbox.min.y) / 2
  }

  const offset = [
    dragOffset[0] / scale / 70,
    dragOffset[1] / scale / 70
  ]

  const handleDragComplete = useCallback(offset => {
    dispatch(updateMetadata({
      layout: layout.map((keyLayout, i) => {
        const withOffset = {
          ...keyLayout,
          x: keyLayout.x + offset[0] / scale / 70,
          y: keyLayout.y + offset[1] / scale / 70
        }

        return keyIndices.includes(i)
          ? withOffset
          : keyLayout
      })
    }))

    setDragOffset([0, 0])
  }, [layout, scale, keyIndices, setDragOffset, dispatch])

  return (
    <>
      {keys.map((key, i) => (
        // Not the best way to do this but it works ok for now
        <KeyPlacer key={i} keyLayout={{
          ...key,
          x: key.x + offset[0],
          y: key.y + offset[1]
        }}>
          <Key index="?" style={{ border: '2px solid royalblue' }} />
        </KeyPlacer>
      ))}
      <div style={{
        position: 'absolute',
        left: `${center.x + dragOffset[0] / scale}px`,
        top: `${center.y + dragOffset[1] / scale}px`
      }}>
        <Axes
          onDragging={setDragOffset}
          onDragComplete={handleDragComplete}
        />
      </div>
    </>
  )
}

function withEmptyGuard (Component) {
  return function ({ keyIndices, ...props }) {
    if (keyIndices.length === 0) {
      return null
    }

    return Component({ ...props, keyIndices })
  }
}

export default withEmptyGuard(TranslationHelper)
