import ReactDOM from 'react-dom'
import { useCallback, useRef } from 'react'

const styles = {
  wrapper: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(104, 123, 162, 0.39)',
    backdropFilter: 'blur(1px)',
    zIndex: '50',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    display: 'block',
    pointerEvents: 'all'
  }
}

export default function Modal ({ onDismiss, children }) {
  const content = useRef()
  const handleClick = useCallback(function (e) {
    if (onDismiss && content.current && e.target.contains(content.current)) {
      e.stopPropagation()
      onDismiss()
    }
  }, [content, onDismiss])

  const style = styles.wrapper

  return ReactDOM.createPortal(
    <div onClick={handleClick} style={style}>
      <div ref={content} style={styles.content}>
        {children}
      </div>
    </div>,
    document.getElementById('modal-root')
  )
}
