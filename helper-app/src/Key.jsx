import classNames from 'classnames'
import PropTypes from 'prop-types'

import * as keyboardLayoutPropTypes from './keyboardLayoutPropTypes'
import styles from './key-styles.module.css'

function Key ({ index, keyLayout, className = '', children, ...props }) {
  const classes = classNames(
    styles.key,
    className
  )

  return (
    <div className={classes} {...props}>
      {children ?? index}
    </div>
  )
}

Key.propTypes = {
  index: PropTypes.any,
  keyLayout: keyboardLayoutPropTypes.keyLayout,
  className: PropTypes.string
}

export default Key
