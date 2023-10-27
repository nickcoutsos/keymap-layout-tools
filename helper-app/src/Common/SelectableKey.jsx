import classNames from 'classnames'

import keyStyles from '../Reorder/key.module.css'
import Key from '../Key.jsx'
import { useSelectionContext } from './SelectableLayout.jsx'

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
    />
  )
}
