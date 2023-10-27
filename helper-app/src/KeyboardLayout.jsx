import isEqual from 'lodash/isEqual'
import pick from 'lodash/pick'
import PropTypes from 'prop-types'
import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import RotationOriginHelper from './LayoutHelpers/RotationOriginHelper.js'
import * as keyboardLayoutPropTypes from './keyboardLayoutPropTypes'
import {
  updateKeySelection,
  selectKeySelection
} from './metadataSlice.js'
import SelectableLayout from './Common/SelectableLayout.jsx'

function matchRotations (keyA, keyB) {
  return isEqual(
    pick(keyA, ['r', 'rx', 'ry']),
    pick(keyB, ['r', 'rx', 'ry'])
  )
}

function KeyboardLayout (props) {
  const { layout, scale } = props
  const [hovering, setHovering] = useState(null)
  const dispatch = useDispatch()
  const selectedKeys = useSelector(selectKeySelection)

  const rotating = hovering !== null && !!layout[hovering].r && (
    layout.reduce((acc, keyLayout, index) => {
      if (matchRotations(keyLayout, layout[hovering])) {
        acc.push({ index, keyLayout })
      }

      return acc
    }, [])
  )

  const handleSelectionUpdate = useCallback(keys => {
    dispatch(updateKeySelection({ keys }))
  }, [dispatch])

  return (
    <>
      <SelectableLayout
        layout={layout}
        scale={scale}
        selection={selectedKeys}
        onUpdate={handleSelectionUpdate}
        onHover={setHovering}
        renderOverlay={(layout) => (
          rotating && rotating.map(({ index }) => (
            <RotationOriginHelper
              key={index}
              showArc={index === hovering}
              keyLayout={layout[index]}
            />
          ))
        )}
      />
    </>
  )
}

KeyboardLayout.propTypes = {
  layout: keyboardLayoutPropTypes.layout.isRequired,
  renderKey: PropTypes.func.isRequired,
  scale: PropTypes.number
}

KeyboardLayout.defaultProps = {
  scale: 1
}

export default KeyboardLayout
