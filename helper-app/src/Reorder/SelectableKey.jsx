import { useReorderContext } from './Context.js'
import { ReorderSelectionContext } from './ReorderSelectionContext.jsx'
import SelectableKey from '../Common/SelectableKey.jsx'

function withReorderSelectionContext (Component) {
  return function SelectableKey (props) {
    const { keyAssignments } = useReorderContext()
    const [assignedRow, assignedCol] = keyAssignments[props.index] || [null, null]
    const label = `(${assignedRow ?? '_'},${assignedCol ?? '_'})`

    return (
      <ReorderSelectionContext>
        <Component {...props}>{label}</Component>
      </ReorderSelectionContext>
    )
  }
}

export default withReorderSelectionContext(SelectableKey)
