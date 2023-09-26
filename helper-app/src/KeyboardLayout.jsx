import isEqual from 'lodash/isEqual'
import pick from 'lodash/pick'
import PropTypes from 'prop-types'
import { useState } from 'react'

import Layout from './Common/Layout.jsx'
import RotationOriginHelper from './LayoutHelpers/RotationOriginHelper.js'
import * as keyboardLayoutPropTypes from './keyboardLayoutPropTypes'

function matchRotations (keyA, keyB) {
  return isEqual(
    pick(keyA, ['r', 'rx', 'ry']),
    pick(keyB, ['r', 'rx', 'ry'])
  )
}

function KeyboardLayout (props) {
  const { layout, renderKey, scale } = props
  const [hovering, setHovering] = useState(null)
  const rotating = hovering !== null && !!layout[hovering].r && (
    layout.reduce((acc, keyLayout, index) => {
      if (matchRotations(keyLayout, layout[hovering])) {
        acc.push({ index, keyLayout })
      }

      return acc
    }, [])
  )

  return (
    <>
      <Layout
        layout={layout}
        scale={scale}
        renderKey={({ keyLayout, index }) => (
          renderKey({
            index,
            keyLayout,
            onMouseEnter: () => setHovering(index),
            onMouseLeave: () => setHovering(null)
          })
        )}
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
