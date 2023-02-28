import PropTypes from 'prop-types'
import styles from './styles.module.css'

function Key ({ index, className = '' }) {
  const classes = [styles.key, className].join(' ')

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
