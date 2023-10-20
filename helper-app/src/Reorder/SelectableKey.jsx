import classNames from 'classnames'

import {
  DRAG_MODE_ADD,
  DRAG_MODE_REMOVE,
  useDragContext
} from '../Common/DragSelector/DragSelector.jsx'
import { useReorderContext } from './Context.js'
import keyStyles from './key.module.css'
import Key from '../Key.jsx'

export default function SelectableKey (props) {
  const { index } = props
  const { dragMode, intersections } = useDragContext()
  const { state, actions, previewSelection, keyAssignments } = useReorderContext()
  const group = state[state.selectionMode][state.selection] || []
  const selected = group.includes(index)
  const previewMarkerHover = previewSelection !== null && (
    state[previewSelection[0]][
      previewSelection[1]
    ].includes(index)
  )

  const previewDragSelect = dragMode === DRAG_MODE_REMOVE
    ? intersections.filter(index => group.includes(index))
    : intersections.filter(index => !group.includes(index))

  const preview = (
    (dragMode === DRAG_MODE_ADD && previewDragSelect.includes(index)) ||
    (previewMarkerHover)
  )

  const previewDeselect = dragMode === DRAG_MODE_REMOVE && previewDragSelect.includes(index)
  const [assignedRow, assignedCol] = keyAssignments[index] || [null, null]
  const label = `(${assignedRow ?? '_'},${assignedCol ?? '_'})`

  return (
    <Key
      {...props}
      index={label}
      onClick={event => {
        event.stopPropagation()
        if (selected) {
          actions.removeFromSelected(index)
        } else {
          actions.addToSelected(index)
        }
      }}
      className={classNames(keyStyles.selectable, {
        [keyStyles.selected]: selected,
        [keyStyles.preview]: preview,
        [keyStyles.previewDeselect]: previewDeselect
      })}
    />
  )
}
