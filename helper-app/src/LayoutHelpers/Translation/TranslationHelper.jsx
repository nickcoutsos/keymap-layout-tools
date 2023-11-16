import classNames from 'classnames'
import cloneDeep from 'lodash/cloneDeep.js'
import { useCallback, useMemo, useState } from 'react'

import {
  bboxUnion,
  getKeyBoundingBox,
  getPositionSizeRotation
} from 'keymap-layout-tools/lib/geometry.js'

import Axes from './Axes.jsx'
import Offset from './Offset.jsx'
import KeyPlacer from '../../KeyPlacer.jsx'
import Key from '../../Key.jsx'
import keyStyles from '../../key-styles.module.css'

const PX_TO_KEY_UNIT = 1 / 70

function TranslationHelper ({ layout, original, scale, keyIndices, onUpdate, step = 0.25, applyImmediately = true }) {
  const [offset, setOffset] = useState([0, 0])
  const snappedOffset = useMemo(() => (
    offset.map(v => Math.round(v / step) * step)
  ), [step, offset])

  const keys = keyIndices.map(i => layout[i])
  const bbox = keys.map(key => (
    getKeyBoundingBox(...getPositionSizeRotation(key))
  )).reduce(bboxUnion)

  const center = {
    x: (bbox.max.x + bbox.min.x) / 2,
    y: (bbox.max.y + bbox.min.y) / 2
  }

  const pixelToKeyUnit = useCallback(v => v * PX_TO_KEY_UNIT / scale, [scale])

  const handleUpdatePixelOffset = useCallback(offset => {
    const [offsetX, offsetY] = offset.map(pixelToKeyUnit)
    setOffset(([x, y]) => ([
      x + offsetX,
      y + offsetY
    ]))
  }, [setOffset, pixelToKeyUnit])

  function handleDragComplete () {
    if (applyImmediately) {
      onUpdate(
        original.map((keyLayout, i) => (
          keyIndices.includes(i)
            ? getTranslatedKey(keyLayout, snappedOffset)
            : keyLayout
        ))
      )

      setOffset([0, 0])
    }
  }

  return (
    <>
      <TranslatingKeys
        offset={snappedOffset}
        keys={keys}
      />

      <div style={{
        position: 'absolute',
        left: `${center.x + offset[0] / PX_TO_KEY_UNIT}px`,
        top: `${center.y + offset[1] / PX_TO_KEY_UNIT}px`
      }}>
        <Axes
          offset={offset}
          onDragging={handleUpdatePixelOffset}
          onDragComplete={handleDragComplete}
        />

        <Offset
          value={snappedOffset}
          onUpdate={setOffset}
        />
      </div>
    </>
  )
}

function TranslatingKeys ({ keys, offset }) {
  if (offset === null) {
    return null
  }

  return (
    <div style={{ pointerEvents: 'none' }}>
      {keys.map((key, i) => (
        // Not the best way to do this but it works ok for now
        <KeyPlacer key={i} keyLayout={getTranslatedKey(key, offset)}>
          <Key className={classNames(
            keyStyles.selected,
            keyStyles.ghost
          )} />
        </KeyPlacer>
      ))}
    </div>
  )
}

function getTranslatedKey (key, offset) {
  const transformed = cloneDeep(key)
  transformed.x += offset[0]
  transformed.y += offset[1]
  if ('rx' in transformed) transformed.rx += offset[0]
  if ('ry' in transformed) transformed.ry += offset[1]
  return transformed
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
