import classNames from 'classnames'
import { useCallback } from 'react'

import styles from './dragSelector.module.css'

export { useDragSelector } from './hook.js'

export function DragSelectContainer (props) {
  const { selecting, trail, children, onMouseDown } = props

  return (
    <div
      onMouseDown={onMouseDown}
      className={classNames(
        styles.container,
        { [styles.selecting]: selecting }
      )}
    >
      {children}
      {selecting && <DragBox {...props} />}
      {/* {trail && <DragTrail {...props} />} */}
    </div>
  )
}

export function DragSelectModeSwitcher ({ mode, onChangeMode }) {
  const handleChange = useCallback(event => {
    onChangeMode(event.target.value)
  }, [onChangeMode])

  return (
    <div>
      <p>
        Region select mode:
        <label>
          <input
            type="radio"
            name="drag-select-mode"
            checked={mode === 'box'}
            onChange={handleChange}
            value="box"
          /> Box
        </label>
        <label>
          <input
            type="radio"
            name="drag-select-mode"
            checked={mode === 'path'}
            onChange={handleChange}
            value="path"
          /> Freehand
        </label>
      </p>
    </div>
  )
}

function DragBox (props) {
  const { negate, rect: [min, max] } = props
  const width = Math.abs(min[0] - max[0]) + 'px'
  const height = Math.abs(min[1] - max[1]) + 'px'

  return (
    <div className={classNames(
      styles.overlay,
      { [styles.negate]: negate }
    )} style={{
      position: 'absolute',
      top: min[1] + 'px',
      left: min[0] + 'px',
      width,
      height
    }} />
  )
}

function DragTrail (props) {
  const { start, trail, boundingBox, offset } = props
  const path = [
    `M ${start[0] - offset[0]} ${start[1] - offset[1]}`,
    ...trail.map(([x, y]) => `L ${x} ${y}`)
  ].join('\n')

  const viewBox = `0 0 ${boundingBox.max.x} ${boundingBox.max.y}`

  return (
    <div style={{ position: 'absolute', pointerEvents: 'none', top: 0, left: 0, width: '100%', height: '100%' }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox}>
        <path fill="none" stroke="royalblue" strokeWidth="2" d={path} />
      </svg>
    </div>
  )
}
