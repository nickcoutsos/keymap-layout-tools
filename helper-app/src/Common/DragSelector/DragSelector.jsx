import classNames from 'classnames'

import { DragContext } from './context'
import { DRAG_STYLE_BOX, DRAG_STYLE_PATH } from './constants.js'
import { DragBox, DragTrail } from './DragOverlays.jsx'
import styles from './dragSelector.module.css'

export {
  DRAG_MODE_ADD,
  DRAG_MODE_REMOVE,
  DRAG_MODE_REPLACE,
  DRAG_STYLE_BOX,
  DRAG_STYLE_PATH
} from './constants.js'
export { useDragContext } from './context'
export { useDragSelector } from './hook.js'

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
      <DragContext.Provider value={{ dragMode: mode, intersections, selecting }}>
        {children}
        {selecting && style === DRAG_STYLE_BOX && <DragBox {...props} />}
        {selecting && style === DRAG_STYLE_PATH && <DragTrail {...props} />}
      </DragContext.Provider>
    </div>
  )
}
