import classNames from 'classnames'

import { useSelectionContext } from './SelectableLayout.jsx'
import keyStyles from '../key-styles.module.css'
import Key from '../Key.jsx'

export default function SelectableKey (props) {
  const { index } = props
  const { selection, previewSelection, previewDeselection } = useSelectionContext()

  const isSelected = selection.includes(index)
  const previewDragSelect = previewSelection.includes(index)
  const previewDeselect = previewDeselection.includes(index)

  return (
    <Key
      {...props}
      className={classNames(keyStyles.selectable, {
        [keyStyles.selected]: isSelected,
        [keyStyles.preview]: previewDragSelect,
        [keyStyles.previewDeselect]: previewDeselect
      })}
    >
      {props.children}
    </Key>
  )
}
