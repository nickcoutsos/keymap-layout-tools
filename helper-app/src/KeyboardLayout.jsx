import PropTypes from 'prop-types'

import KeyPlacer from './KeyPlacer.jsx'
import * as keyboardLayoutPropTypes from './keyboardLayoutPropTypes'
import styles from './styles.module.css'

function KeyboardLayout (props) {
  const { layout, renderKey, scale } = props

  return (
    <div className={styles.layout} style={{ transform: `scale(${scale})` }}>
      {layout.map((keyLayout, index) => (
        <KeyPlacer key={index} keyLayout={keyLayout}>
          {renderKey({ index, keyLayout })}
        </KeyPlacer>
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
