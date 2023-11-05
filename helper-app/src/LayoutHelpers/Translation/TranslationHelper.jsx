import cloneDeep from 'lodash/cloneDeep.js'
import classNames from 'classnames'
import { useCallback, useMemo, useState } from 'react'
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
import keyStyles from '../../key-styles.module.css'

function TranslationHelper ({ layout, original, scale, keyIndices }) {
  const dispatch = useDispatch()
  const [dragOffset, setDragOffset] = useState(null)
  const step = 0.25
  const snappedOffset = useMemo(() => dragOffset && (
    dragOffset.map(v => Math.round(v / scale / 70 / step) * step)
  ), [step, scale, dragOffset])

  const keys = keyIndices.map(i => layout[i])
  const bbox = keys.map(key => (
    getKeyBoundingBox(...getPositionSizeRotation(key))
  )).reduce(bboxUnion)

  const center = {
    x: (bbox.max.x + bbox.min.x) / 2,
    y: (bbox.max.y + bbox.min.y) / 2
  }

  const handleDragComplete = useCallback(offset => {
    offset = offset.map(v => Math.round(v / scale / 70 / step) * step)

    dispatch(updateMetadata({
      keepSelection: true,
      layout: original.map((keyLayout, i) => (
        keyIndices.includes(i)
          ? getTranslatedKey(keyLayout, offset)
          : keyLayout
      ))
    }))

    setDragOffset(null)
  }, [original, step, scale, keyIndices, setDragOffset, dispatch])

  return (
    <>
      <TranslatingKeys offset={snappedOffset} scale={scale} keys={keys} />
      <div style={{
        position: 'absolute',
        left: `${center.x + (dragOffset?.[0] || 0) / scale}px`,
        top: `${center.y + (dragOffset?.[1] || 0) / scale}px`
      }}>
        <Axes
          onDragging={setDragOffset}
          onDragComplete={handleDragComplete}
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
    <>
      {keys.map((key, i) => (
        // Not the best way to do this but it works ok for now
        <KeyPlacer key={i} keyLayout={getTranslatedKey(key, offset)}>
          <Key className={classNames(
            keyStyles.selected,
            keyStyles.ghost
          )} />
        </KeyPlacer>
      ))}
    </>
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
