import classNames from 'classnames'
import isEqualWith from 'lodash/isEqualWith.js'
import { useEffect, useMemo } from 'react'

import Layout from '../../Common/Layout.jsx'
import Key from '../../Key.jsx'
import styles from './styles.module.css'

import { toOrigin } from 'keymap-layout-tools/lib/modifiers.js'
import { bboxUnion, getLayoutBoundingRect } from 'keymap-layout-tools/lib/geometry.js'

const SCALE = 0.45

export default function Normalize ({ layout, onUpdate }) {
  const normalized = useMemo(() => (
    toOrigin(layout)
  ), [layout])

  const alreadyNormalized = useMemo(() => (
    isCloseToEqual(layout, normalized)
  ), [layout, normalized])

  // Combine both versions to render in the same coordinate space
  const {
    combined,
    bboxOriginal,
    bboxNormalized,
    bboxCombined
  } = useMemo(() => {
    const combined = [...normalized, ...layout]
    const bboxOriginal = getLayoutBoundingRect(layout)
    const bboxNormalized = getLayoutBoundingRect(normalized)
    const bboxCombined = bboxUnion(bboxOriginal, bboxNormalized)
    return { combined, bboxOriginal, bboxNormalized, bboxCombined }
  }, [layout, normalized])

  useEffect(() => {
    onUpdate(normalized)
  }, [normalized, onUpdate])

  if (alreadyNormalized) {
    return (
      <>
        <Layout
          layout={combined}
          normalize={false}
          scale={SCALE}
          overrides={{ margin: '0 auto' }}
          renderKey={Key}
        />
        <p className={styles.messageOverlay}>
          Layout is already normalized
        </p>
      </>
    )
  }

  return (
    <div className={styles.normalizeWrapper}>
      <h3>Preview</h3>
      <ul>
        <li><span className={classNames(styles.axes, styles.legend)} /> Origin <code>(0, 0)</code></li>
        <li><span className={classNames(styles.legend, styles.original)} /> Original layout</li>
        <li><span className={classNames(styles.legend, styles.normalized)} /> Shifted layout</li>
      </ul>
      <div style={{
        height: `${SCALE * (bboxCombined.max.y - bboxCombined.min.y)}px`,
        margin: '30px 0 10px'
      }}>
        <Layout
          layout={layout}
          scale={SCALE}
          overrides={{ margin: '0 auto' }}
          renderKey={({ keyLayout, index }) => (
            <Key
              index=""
              keyLayout={keyLayout}
              className={classNames({
                [styles.original]: index >= layout.length,
                [styles.normalized]: index < layout.length
              })}
            />
          )}
          renderOverlay={() => (
            <>
              <div
                className={styles.axes}
                style={{
                  position: 'absolute',
                  top: `${-bboxCombined.min.y}px`,
                  left: `${-bboxCombined.min.x}px`
                }}
              />
              <BoundingBox bbox={bboxOriginal} offset={bboxCombined} color="var(--original)" />
              <BoundingBox bbox={bboxNormalized} offset={bboxCombined} color="var(--normalized)" />
            </>
          )}
        />
      </div>
    </div>
  )
}

function isCloseToEqual (layoutA, layoutB) {
  return isEqualWith(layoutA, layoutB, (valA, valB) => {
    return (typeof valA === 'number' && typeof valB === 'number')
      ? Math.abs(valA - valB) < Number.EPSILON
      : undefined
  })
}

function BoundingBox ({ bbox, offset, color }) {
  return (
    <div style={{
      position: 'absolute',
      top: `${-offset.min.y + bbox.min.y}px`,
      left: `${-offset.min.x + bbox.min.x}px`,
      width: `${bbox.max.x - bbox.min.x}px`,
      height: `${bbox.max.y - bbox.min.y}px`,
      border: `2px solid ${color}`,
      opacity: 0.5
    }} />
  )
}
