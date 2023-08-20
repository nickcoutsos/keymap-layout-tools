import classNames from 'classnames'

import styles from './dialog.module.css'

export function Dialog ({ children }) {
  return (
    <div className={styles.dialog}>
      {children}
    </div>
  )
}

export function DialogHeading ({ children, className = '', ...props }) {
  return (
    <div className={classNames(styles.heading, className)} {...props}>
      {children}
    </div>
  )
}

export function DialogNote ({ children, className = '', ...props }) {
  return (
    <div className={classNames(styles.note, className)} {...props}>
      {children}
    </div>
  )
}
