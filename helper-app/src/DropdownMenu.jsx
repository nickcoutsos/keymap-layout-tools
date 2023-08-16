import styles from './DropdownMenu.module.css'

export default function DropdownMenu ({ text, actions }) {
  return (
    <span className={styles.wrapper}>
      <button>{text}</button>
      <div className={styles.childrenWrapper}>
        <ul>
          {actions.map((action, i) => (
            <li key={i}>
              <button onClick={action.callback}>
                {action.content}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </span>
  )
}
