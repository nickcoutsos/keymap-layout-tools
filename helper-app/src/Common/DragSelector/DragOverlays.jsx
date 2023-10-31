import classNames from 'classnames'

import {
  DRAG_MODE_REMOVE
} from './constants.js'

import styles from './dragSelector.module.css'

export function DragBox (props) {
  const { mode, rect: [min, max] } = props
  const width = Math.abs(min[0] - max[0]) + 'px'
  const height = Math.abs(min[1] - max[1]) + 'px'

  return (
    <div className={classNames(
      styles.overlay,
      { [styles.negate]: mode === DRAG_MODE_REMOVE }
    )} style={{
      position: 'absolute',
      top: min[1] + 'px',
      left: min[0] + 'px',
      width,
      height
    }} />
  )
}

export function DragTrail (props) {
  const { start, trail, boundingBox } = props
  const path = [
    `M ${start[0]} ${start[1]}`,
    ...trail.map(([x, y]) => `L ${x} ${y}`)
  ].join('\n')

  const viewBox = `0 0 ${boundingBox.max.x} ${boundingBox.max.y}`

  return (
    <div style={{
      position: 'absolute',
      pointerEvents: 'none',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%'
    }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox}>
        <path
          fill="none"
          stroke="royalblue"
          strokeWidth="2"
          strokeDasharray="4 2"
          d={path}
        />
      </svg>
    </div>
  )
}
