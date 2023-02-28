import omit from 'lodash/omit'
import pick from 'lodash/pick'
import { getComputedParams } from 'keymap-layout-tools/lib/geometry'

import KeyPlacer from './KeyPlacer.jsx'
import Key from './Key.jsx'
import styles from './styles.module.css'

const getPosition = keyLayout => pick(keyLayout, ['x', 'y'])
const getRotation = keyLayout => {
  const { rx, ry, r } = keyLayout
  return { x: rx, y: ry, a: r }
}
const getSize = keyLayout => {
  const { w = 1, u = w, h = 1 } = keyLayout
  return { u, h }
}

function rotatePoint (point, origin, degrees) {
  const radians = Math.PI * degrees / 180
  const x = point[0] - origin[0]
  const y = point[1] - origin[1]

  return [
    origin[0] + x * Math.cos(radians) - y * Math.sin(radians),
    origin[1] + y * Math.cos(radians) + x * Math.sin(radians)
  ]
}

function Arc ({ start, angle }) {
  const r = Math.sqrt(
    Math.pow(start[0], 2) +
    Math.pow(start[1], 2)
  )
  const radii = [r, r]
  const end = rotatePoint(start, [0, 0], angle)
  const width = 2

  const size = r + width / 2
  const sweep = angle < 0 ? 0 : 1

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${r * 2 + width}px`}
      height={`${r * 2 + width}px`}
      viewBox={`${-size} ${-size} ${size * 2} ${size * 2}`}
      style={{
        position: 'absolute',
        top: '0px',
        stroke: 'royalblue',
        strokeDasharray: 5,
        strokeWidth: width,
        fill: 'none',
        display: 'block',
        width: `${size * 2}px`,
        height: `${size * 2}px`,
        pointerEvents: 'none',
        transformOrigin: '50% 50%',
        transform: `translate(-50%, -50%) rotate(${-180}deg)`
      }}
    >
      <path
        d={`
          M ${start.join(' ')}
          A ${radii.join(' ')}
            0 0 ${sweep}
            ${end.join(' ')}
        `}
      />
    </svg>
  )
}

export default function RotationOriginHelper ({ keyLayout }) {
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
      <div style={{ position: 'absolute', ...positionStyle }}>
        <div className={styles.originMarker}>
          <p>({position.x}, {position.y})</p>
        </div>
        <div className={styles.rotationMarker} style={{
          height: `${hyp}px`,
          transform: `rotate(${-90 + startAngle}deg)`
        }} />
        <Arc
          start={[delta[0] - 2.5, delta[1] - 2.5]}
          angle={angle}
        />
      </div>
      <KeyPlacer keyLayout={omit(keyLayout, 'r')}>
        <Key index="" className={styles.transformedGhost} />
      </KeyPlacer>
    </div>
  )
}
