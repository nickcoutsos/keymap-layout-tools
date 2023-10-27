import classNames from 'classnames'
import { useCallback } from 'react'

import styles from './dragSelector.module.css'

import {
  DragContext,
  DRAG_MODE_REMOVE,
  DRAG_STYLE_BOX,
  DRAG_STYLE_PATH
} from './hook.js'

export {
  DRAG_MODE_ADD,
  DRAG_MODE_REMOVE,
  DRAG_MODE_REPLACE,
  DRAG_STYLE_BOX,
  DRAG_STYLE_PATH,
  useDragContext,
  useDragSelector
} from './hook.js'

export function DragSelectContainer (props) {
  const { style, selecting, children, onMouseDown } = props
  const { mode, intersections } = props

  return (
    <div
      onMouseDown={onMouseDown}
      className={classNames(
        styles.container,
        { [styles.selecting]: selecting }
      )}
    >
      <DragContext.Provider value={{ dragMode: mode, intersections }}>
        {children}
        {selecting && style === DRAG_STYLE_BOX && <DragBox {...props} />}
        {selecting && style === DRAG_STYLE_PATH && <DragTrail {...props} />}
      </DragContext.Provider>
    </div>
  )
}

export function DragSelectStyleSwitcher ({ style, onChangeStyle }) {
  const handleChange = useCallback(event => {
    onChangeStyle(event.target.value)
  }, [onChangeStyle])

  return (
    <div>
      <p>
        Region select style:
        <label>
          <input
            type="radio"
            name="drag-select-style"
            checked={style === DRAG_STYLE_BOX}
            onChange={handleChange}
            value="box"
          /> Box
        </label>
        <label>
          <input
            type="radio"
            name="drag-select-style"
            checked={style === DRAG_STYLE_PATH}
            onChange={handleChange}
            value="path"
          /> Freehand
        </label>
      </p>
    </div>
  )
}

function DragBox (props) {
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

function DragTrail (props) {
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
