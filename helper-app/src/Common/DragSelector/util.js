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

function bboxContainsPoint (bbox, { x, y }) {
  return (
    bbox[0][0] < x && x < bbox[1][0] &&
    bbox[0][1] < y && y < bbox[1][1]
  )
}

function vec (a, b) {
  return { x: b.x - a.x, y: b.y - a.y }
}
function cross (a, b) {
  return a.x * b.y - a.y * b.x
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
