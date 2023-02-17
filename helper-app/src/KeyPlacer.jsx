import pick from 'lodash/pick'
import PropTypes from 'prop-types'
import { getKeyStyles } from 'keymap-layout-tools/lib/geometry'

import styles from './styles.module.css'
import * as keyboardLayoutPropTypes from './keyboardLayoutPropTypes'

const getPosition = keyLayout => pick(keyLayout, ['x', 'y'])
const getRotation = keyLayout => {
  const { rx, ry, r } = keyLayout
  return { x: rx, y: ry, a: r }
}
const getSize = keyLayout => {
  const { w = 1, u = w, h = 1 } = keyLayout
  return { u, h }
}

function KeyPlacer (props) {
  const { keyLayout, children, ...rest } = props
  const position = getPosition(keyLayout)
  const rotation = getRotation(keyLayout)
  const size = getSize(keyLayout)
  const positioningStyle = getKeyStyles(position, size, rotation)

  return (
    <div className={styles.placer} style={positioningStyle} {...rest}>
      {children}
    </div>
  )
}

KeyPlacer.propTypes = {
  scale: PropTypes.number,
  keyLayout: keyboardLayoutPropTypes.keyLayout.isRequired
}

KeyPlacer.defaultProps = {
  scale: 1
}

export default KeyPlacer
