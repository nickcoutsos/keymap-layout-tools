import classNames from 'classnames'
import PropTypes from 'prop-types'
import styles from './styles.module.css'

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
  label: PropTypes.string,
  value: PropTypes.any.isRequired
}

export default Key
