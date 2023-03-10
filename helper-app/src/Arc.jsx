function rotatePoint (point, origin, degrees) {
  const radians = Math.PI * degrees / 180
  const x = point[0] - origin[0]
  const y = point[1] - origin[1]

  return [
    origin[0] + x * Math.cos(radians) - y * Math.sin(radians),
    origin[1] + y * Math.cos(radians) + x * Math.sin(radians)
  ]
}

export default function Arc ({ start, angle }) {
  const r = Math.sqrt(
    Math.pow(start[0], 2) +
    Math.pow(start[1], 2)
  )
  const radii = [r, r]
  const end = rotatePoint(start, [0, 0], angle)
  const width = 4

  const size = r + width / 2
  const sweep = angle < 0 ? 0 : 1

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${r * 2 + width}px`}
      height={`${r * 2 + width}px`}
      viewBox={`${-size} ${-size} ${size * 2} ${size * 2}`}
      style={{
        position: 'absolute',
        top: '0px',
        stroke: 'royalblue',
        strokeDasharray: 5,
        strokeWidth: width,
        fill: 'none',
        display: 'block',
        width: `${size * 2}px`,
        height: `${size * 2}px`,
        pointerEvents: 'none',
        transformOrigin: '50% 50%',
        transform: `translate(-50%, -50%) rotate(${-180}deg)`
      }}
    >
      <path
        d={`
          M ${start.join(' ')}
          A ${radii.join(' ')}
            0 0 ${sweep}
            ${end.join(' ')}
        `}
      />
    </svg>
  )
}
