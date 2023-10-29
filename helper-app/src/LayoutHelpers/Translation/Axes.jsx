import classNames from 'classnames'
import { useCallback, useEffect, useState } from 'react'

import styles from './styles.module.css'

export default function Axes ({ onDragging, onDragComplete }) {
  const [dragState, setDragState] = useState(null)

  useEffect(() => {
    if (!dragState) {
      return
    }

    function getEventDelta (event) {
      event.preventDefault()
      event.stopPropagation()
      const delta = [
        event.clientX - dragState.start[0],
        event.clientY - dragState.start[1]
      ]

      if (dragState.axis === 'x') {
        delta[1] = 0
      } else {
        delta[0] = 0
      }

      return delta
    }

    function handleDrag (event) {
      onDragging(getEventDelta(event))
    }

    function endDrag (event) {
      onDragComplete(getEventDelta(event))
      setDragState(null)
    }

    document.body.addEventListener('mousemove', handleDrag)
    document.body.addEventListener('mouseup', endDrag)
    return () => {
      document.body.removeEventListener('mousemove', handleDrag)
      document.body.removeEventListener('mouseup', endDrag)
    }
  }, [dragState, setDragState, onDragging, onDragComplete])

  const startDrag = useCallback((event) => {
    event.stopPropagation()
    event.preventDefault()

    setDragState({
      axis: event.target.dataset.axis,
      start: [event.clientX, event.clientY]
    })
  }, [setDragState])

  return (
    <div className={styles.axesContainer}>
      <div onMouseDown={startDrag} data-axis="x" className={classNames(styles.axis)} />
      <div onMouseDown={startDrag} data-axis="y" className={classNames(styles.axis)} />
      <div className={styles.origin} />
    </div>
  )
}
