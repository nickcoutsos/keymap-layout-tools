import classNames from 'classnames'
import styles from './markers.module.css'

export function Marker ({ children, className, active = false, ...props }) {
  return (
    <div className={classNames(
      styles.marker,
      className,
      { [styles.active]: active }
    )} {...props}>
      {children}
    </div>
  )
}

export function RowMarker ({ number, ...props }) {
  return (
    <Marker {...props}>
      Row #{number}
    </Marker>
  )
}

export function ColMarker ({ number, className = '', ...props }) {
  return (
    <Marker className={classNames(className, styles.vertical)} {...props}>
      Col #{number}
    </Marker>
  )
}
