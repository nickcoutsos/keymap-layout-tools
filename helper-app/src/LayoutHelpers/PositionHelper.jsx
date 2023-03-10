import { getComputedParams } from 'keymap-layout-tools/lib/geometry'
import { getPosition, getRotation, getSize } from './selectors'
import styles from './styles.module.css'

export default function PositionHelper ({ keyLayout }) {
  const position = getPosition(keyLayout)
  const rotation = getRotation(keyLayout)
  const size = getSize(keyLayout)
  const { x, y } = getComputedParams(position, size, rotation)

  // subtract half of the "margin"
  const positionStyle = {
    left: `${x - 2.5}px`,
    top: `${y - 2.5}px`
  }

  return (
    <div style={{ position: 'absolute', ...positionStyle }}>
      <div className={styles.originMarker}>
        <p>({position.x}, {position.y})</p>
      </div>
    </div>
  )
}
