import filter from 'lodash/filter'
import isEqual from 'lodash/isEqual'
import pick from 'lodash/pick'
import PropTypes from 'prop-types'
import { useState } from 'react'

import KeyPlacer from './KeyPlacer.jsx'
import RotationOriginHelper from './RotationOriginHelper.js'
import * as keyboardLayoutPropTypes from './keyboardLayoutPropTypes'
import styles from './styles.module.css'

function matchRotations (keyA, keyB) {
  return isEqual(
    pick(keyA, ['r', 'rx', 'ry']),
    pick(keyB, ['r', 'rx', 'ry'])
  )
}

function KeyboardLayout (props) {
  const { layout, renderKey, scale } = props
  const [hovering, setHovering] = useState(null)
  const rotating = hovering && !!layout[hovering].r && (
    layout.reduce((acc, keyLayout, index) => {
      if (matchRotations(keyLayout, layout[hovering])) {
        acc.push({ index, keyLayout })
      }

      return acc
    }, [])
  )

  return (
    <div className={styles.layout} style={{ transform: `scale(${scale})` }}>
      {layout.map((keyLayout, index) => (
        <KeyPlacer
          key={index}
          keyLayout={keyLayout}
          // this will probably break if keys overlap
          onMouseEnter={() => setHovering(index)}
          onMouseLeave={() => setHovering(null)}
        >
          {renderKey({ index, keyLayout })}
        </KeyPlacer>
      ))}
      {rotating && rotating.map(({ index, keyLayout }) => (
        <RotationOriginHelper
          key={index}
          showArc={index === hovering}
          keyLayout={keyLayout}
        />
      ))}
    </div>
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
