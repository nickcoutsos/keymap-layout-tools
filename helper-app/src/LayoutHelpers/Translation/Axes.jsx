import compact from 'lodash/compact'
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
      return [
        event.movementX * (dragState.axes.includes('x') ? 1 : 0),
        event.movementY * (dragState.axes.includes('y') ? 1 : 0)
      ]
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
      axes: compact([
        event.target.dataset.axisX && 'x',
        event.target.dataset.axisY && 'y'
      ]),
      start: [event.clientX, event.clientY]
    })
  }, [setDragState])

  return (
    <div className={styles.axesContainer}>
      <div onMouseDown={startDrag} data-axis-x className={styles.handle} />
      <div onMouseDown={startDrag} data-axis-y className={styles.handle} />
      <div onMouseDown={startDrag} data-axis-x data-axis-y className={styles.origin} />
    </div>
  )
}
