import classNames from 'classnames'
import PropTypes from 'prop-types'

import * as keyboardLayoutPropTypes from './keyboardLayoutPropTypes'
import styles from './key-styles.module.css'

function Key ({ index, keyLayout, className = '', ...props }) {
  const classes = classNames(
    styles.key,
    className
  )

  return (
    <div className={classes} {...props}>
      {index}
    </div>
  )
}

Key.propTypes = {
  index: PropTypes.any.isRequired,
  keyLayout: keyboardLayoutPropTypes.keyLayout,
  className: PropTypes.string
}

export default Key
