import omit from 'lodash/omit'
import { getComputedParams } from 'keymap-layout-tools/lib/geometry'

import Arc from './Arc.jsx'
import { getPosition, getRotation, getSize } from './selectors.js'
import KeyPlacer from '../KeyPlacer.jsx'
import Key from '../Key.jsx'
import styles from './styles.module.css'

export default function RotationOriginHelper ({ showArc, keyLayout }) {
  const position = getPosition(keyLayout)
  const rotation = getRotation(keyLayout)
  const size = getSize(keyLayout)
  const { x, y, u, h, a: angle, rx, ry } = getComputedParams(position, size, rotation)
  const delta = [rx - u / 2, ry - h / 2]
  const hyp = Math.sqrt(
    delta[0] * delta[0] +
    delta[1] * delta[1]
  )

  const ox = -rx + u / 2 + 2.5
  const oy = -ry + h / 2 + 2.5

  const startAngle = Math.atan2(oy, ox) * 180 / Math.PI

  // subtract half of the "margin"
  const positionStyle = {
    left: `${x + rx - 2.5}px`,
    top: `${y + ry - 2.5}px`
  }

  return (
    <div className={styles.rotationOriginHelper}>
      <KeyPlacer keyLayout={omit(keyLayout, 'r')}>
        <Key index="" className={styles.transformedGhost} />
      </KeyPlacer>
      {showArc && (
        <>
          <div style={{ position: 'absolute', ...positionStyle }}>
            <div className={styles.originMarker}>
              <p>({rotation.x}, {rotation.y})</p>
            </div>
            <div className={styles.rotationMarker} style={{
              height: `${hyp}px`,
              transform: `translate(-50%) rotate(${-90 + startAngle}deg)`
            }} />
            <Arc
              start={[delta[0] - 2.5, delta[1] - 2.5]}
              angle={angle}
            />
          </div>
          <KeyPlacer keyLayout={keyLayout}>
            <Key index="" className={styles.transformed} />
          </KeyPlacer>
        </>
      )}
    </div>
  )
}
