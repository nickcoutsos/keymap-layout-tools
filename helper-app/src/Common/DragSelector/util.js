export function getRelativeAncestor (element) {
  // This isn't great. Iterating through ancestors is not ideal, having to check
  // the height of the bounding client rect because I know that one of them is
  // not going to give me the desired result is worse. This is less appropriate
  // than using a ref, but I don't like passing it back from the hook as its
  // "context" in order to pass it to the rendered component.
  // Most likely this whole component should be a wrapper of the placed keys and
  // using cloneElement or something, I don't know.
  while (
    (element = element.parentNode) &&
    (window.getComputedStyle(element).position !== 'relative' || !element.getBoundingClientRect().height)
  );

  return element
}

export function getIntersectingPolygons (rect, polygons) {
  const rectSegments = segmentsFromPoly(polygonFromRect(rect))

  return polygons.reduce((acc, points, i) => {
    if (
      points.some(point => bboxContainsPoint(rect, point)) ||
      segmentsFromPoly(points).some(a => rectSegments.some(b => lineSegmentsIntersect(a, b)))
    ) {
      acc.push(i)
    }
    return acc
  }, [])
}

export function getIntersectingPolygonsTrail (trail, polygons) {
  const trailSegments = trail
    .map(([x, y]) => ({ x, y }))
    .reduce((segments, point, i, arr) => {
      if (i < arr.length - 1) {
        segments.push([point, arr[i + 1]])
      }
      return segments
    }, [])

  return polygons.reduce((acc, points, i) => {
    if (
      segmentsFromPoly(points).some(a => trailSegments.some(b => lineSegmentsIntersect(a, b)))
    ) {
      acc.push(i)
    }
    return acc
  }, [])
}

// These should all be moved to keymap-editor-tools/lib/geometry.

function bboxContainsPoint (bbox, { x, y }) {
  return (
    bbox[0][0] < x && x < bbox[1][0] &&
    bbox[0][1] < y && y < bbox[1][1]
  )
}

function vec (from, to) {
  return {
    x: to.x - from.x,
    y: to.y - from.y
  }
}

function unit (v) {
  const norm = Math.sqrt(v.x * v.x + v.y * v.y)
  return {
    x: v.x / norm,
    y: v.y / norm
  }
}

function perp ({ x, y }) {
  return {
    x: y,
    y: -x
  }
}
function cross (a, b) {
  return a.x * b.y - a.y * b.x
}
function dot (a, b) {
  return (a.x * b.x) + (a.y * b.y)
}

// https://www.geeksforgeeks.org/check-if-two-given-line-segments-intersect/

function lineSegmentsIntersect ([a0, a1], [b0, b1]) {
  const a = vec(a0, a1)
  const b = vec(b0, b1)

  const aCrossAb0 = cross(a, vec(a1, b0))
  const aCrossAb1 = cross(a, vec(a1, b1))

  const bCrossBa0 = cross(b, vec(b1, a0))
  const bCrossBa1 = cross(b, vec(b1, a1))

  return (
    Math.sign(aCrossAb0) !== Math.sign(aCrossAb1) &&
    Math.sign(bCrossBa0) !== Math.sign(bCrossBa1)
  )
}

function polygonFromRect (rect) {
  const [[x1, y1], [x2, y2]] = rect
  return [
    { x: x1, y: y1 },
    { x: x1, y: y2 },
    { x: x2, y: y2 },
    { x: x2, y: y1 }
  ]
}

function segmentsFromPoly (poly) {
  const [a, b, c, d] = poly
  return [
    [a, b],
    [b, c],
    [c, d],
    [d, a]
  ]
}

/**
 * Check if two convex polygons intersect
 *
 * Based on separating-axis-theorem:
 * https://www.metanetsoftware.com/technique/tutorialA.html#section1
 *
 * @param {Array<{x, y}>} polyA four points ordered counter-clockwise
 * @param {Array<{x, y}>} polyB four points ordered counter-clockwise
 * @param {Object} [options={}]
 * @param {boolean} [options.bothAreQuads=false] assert that both polygons are quadrilaterals to simplify the intersection test
 * @param {number} [options.threshold=0] minimum overlap distance before counting as an intersection
 * @returns {boolean}
 */
export function polygonsIntersect (polyA, polyB, options = {}) {
  const {
    bothAreQuads = false,
    threshold = 0
  } = options

  const segments = [
    ...segmentsFromPoly(polyA).slice(0, bothAreQuads ? 2 : undefined),
    ...segmentsFromPoly(polyB).slice(0, bothAreQuads ? 2 : undefined)
  ]

  for (const segment of segments) {
    const axis = unit(perp(vec(...segment)))
    const aBounds = getProjectedBounds(polyA, axis)
    const bBounds = getProjectedBounds(polyB, axis)
    if (getOverlapDistance(aBounds, bBounds) < threshold) {
      return false
    }
  }

  return true
}

/**
 * Return the min and max scalar of a set of points projected onto an axis
 * @param {Array<{x, y}>} points
 * @param {Vector} axis
 * @returns {Array<Number>}
 */
function getProjectedBounds (points, axis) {
  return points.reduce(([min, max], point) => {
    const scalar = dot(point, axis)
    return [
      Math.min(min, scalar),
      Math.max(max, scalar)
    ]
  }, [Infinity, -Infinity])
}

/**
 * Measure the overlap of two ranges (1-dimensional line segments)
 * @param {Array<Number>} a
 * @param {Array<Number>} b
 * @returns {Number}
 */
function getOverlapDistance (a, b) {
  const [a_, b_] = [a, b].sort(([aMin], [bMin]) => aMin - bMin)

  if (b_[0] > a_[1]) {
    return 0
  }

  return b_[1] < a_[1]
    ? (b_[1] - b_[0])
    : (a_[1] - b_[0])
}
