import PropTypes from 'prop-types'
import { useState } from 'react'

import KeyPlacer from './KeyPlacer.jsx'
import RotationOriginHelper from './RotationOriginHelper.js'
import * as keyboardLayoutPropTypes from './keyboardLayoutPropTypes'
import styles from './styles.module.css'

function KeyboardLayout (props) {
  const { layout, renderKey, scale } = props
  const [hovering, setHovering] = useState(null)

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
      {hovering != null && !!layout[hovering].r && (
        <RotationOriginHelper keyLayout={layout[hovering]} />
      )}
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
