import map from 'lodash/map.js'

const DEFAULT_SIZE = 70
const DEFAULT_PADDING = 5

export function getComputedParams (position, size, rotation = {}, options = {}) {
  const { keySize = DEFAULT_SIZE } = options
  return {
    x: position.x * keySize,
    y: position.y * keySize,
    u: size.u * keySize,
    h: size.h * keySize,
    rx: (position.x - (rotation.x ?? position.x)) * -keySize,
    ry: (position.y - (rotation.y ?? position.y)) * -keySize,
    a: rotation.a || 0
  }
}

// I hate this so much, I need to update function signatures to just take the
// `keyLayout` type and do this in one place.
export function getPositionSizeRotation (key) {
  return [
    { x: key.x, y: key.y },
    { u: key.u || key.w || 1, h: key.h || 1 },
    { x: key.rx, y: key.ry, a: key.r }
  ]
}

export function getKeyStyles (position, size, rotation, options = {}) {
  const { x, y, u, h, a, rx, ry } = getComputedParams(position, size, rotation, options)
  const { padding: p = DEFAULT_PADDING } = options

  return {
    top: `${y}px`,
    left: `${x}px`,
    width: `${u - p}px`,
    height: `${h - p}px`,
    transformOrigin: `${rx}px ${ry}px`,
    transform: `rotate(${a || 0}deg) translate(${p / 2}px, ${p / 2}px)`
  }
}

export function transformKeyPolygon (position, size, rotation, options = {}) {
  const { x, y, u, h, a, rx, ry } = getComputedParams(position, size, rotation, options)

  const points = [
    { x: 0, y: 0 },
    { x: u, y: 0 },
    { x: u, y: h },
    { x: 0, y: h }
  ]

  function translate (point) {
    return {
      x: point.x + x,
      y: point.y + y
    }
  }

  function rotate (point) {
    const x = point.x - rx
    const y = point.y - ry
    const angle = Math.PI * a / 180

    return {
      x: rx + x * Math.cos(angle) - y * Math.sin(angle),
      y: ry + y * Math.cos(angle) + x * Math.sin(angle)
    }
  }

  return points.map(rotate).map(translate)
}

export function getKeyBoundingBox (position, size, rotation, options = {}) {
  return bbox(transformKeyPolygon(position, size, rotation, options))
}

/**
 * Get the transformed polygon for each key.
 * @param {Array<LayoutKey>} layout
 * @returns {Object}
 */
export function getLayoutKeyPolygons (layout) {
  return layout.map(key => transformKeyPolygon(
    { x: key.x, y: key.y },
    { u: key.u || key.w || 1, h: key.h || 1 },
    { x: key.rx, y: key.ry, a: key.r },
    { keySize: 1, padding: 0 }
  ))
}

/**
 * Calculate bounding box of layout
 * @param {Array<LayoutKey>} layout
 * @returns {Object}
 */
export function getLayoutBoundingRect (layout, options = {}) {
  return layout.map(key => getKeyBoundingBox(
    { x: key.x, y: key.y },
    { u: key.u || key.w || 1, h: key.h || 1 },
    { x: key.rx, y: key.ry, a: key.r },
    options
    // { keySize: 1, padding: 0 }
  )).reduce(bboxUnion, {
    min: { x: Infinity, y: Infinity },
    max: { x: -Infinity, y: -Infinity }
  })
}

export function bbox (polygon) {
  const xValues = map(polygon, 'x')
  const yValues = map(polygon, 'y')
  const min = {
    x: Math.min(...xValues),
    y: Math.min(...yValues)
  }
  const max = {
    x: Math.max(...xValues),
    y: Math.max(...yValues)
  }

  return { min, max }
}

export function bboxUnion (a, b) {
  return {
    min: {
      x: Math.min(a.min.x, b.min.x),
      y: Math.min(a.min.y, b.min.y)
    },
    max: {
      x: Math.max(a.max.x, b.max.x),
      y: Math.max(a.max.y, b.max.y)
    }
  }
}
