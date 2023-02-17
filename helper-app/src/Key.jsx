import PropTypes from 'prop-types'
import styles from './styles.module.css'

function Key({ index, keyLayout }) {
  const classes = [
    styles.key,
    'r' in keyLayout ? styles.debugKeyRotation : ''
  ].join(' ')

  return (
    <div className={classes}>
      {index}
    </div>
  )
}

Key.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any.isRequired
}

export default Key
