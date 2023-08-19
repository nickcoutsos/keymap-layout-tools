import classNames from 'classnames'
import clamp from 'lodash/clamp.js'
import { useCallback, useState, useEffect } from 'react'

import styles from './dragSelector.module.css'

function DragSelectContainer (props) {
  const { onMouseDown } = props
  const { selecting, negate, rect, size } = props
  const { children } = props

  return (
    <div
      onMouseDown={onMouseDown}
      className={classNames(
        styles.container,
        { [styles.selecting]: selecting }
      )}
    >
      {children}
      {selecting && (
        <div className={classNames(
          styles.overlay,
          { [styles.negate]: negate }
        )} style={{
          position: 'absolute',
          top: rect[0][1] + 'px',
          left: rect[0][0] + 'px',
          width: size[0] + 'px',
          height: size[1] + 'px'
        }} />
      )}
    </div>
  )
}

export function useDragSelector ({ polygons, onSelect }) {
  const [state, setState] = useState({})

  const handleMouseDown = useCallback(event => {
    const offsetElement = getRelativeAncestor(event.target)
    const rect = offsetElement.getBoundingClientRect()
    const { clientX: x, clientY: y } = event

    event.preventDefault()
    setState({
      start: [x, y],
      intersecting: [],
      offset: [rect.left, rect.top],
      offsetRect: rect
    })
  }, [setState])

  const handleKeyDown = useCallback(event => {
    if (!state.selecting || event.repeat || !event.shiftKey) {
      return
    }

    setState(state => ({ ...state, negate: true }))
  }, [state.selecting, setState])

  const handleKeyUp = useCallback(event => {
    if (!state.negate || event.repeat || event.shiftKey) {
      return
    }

    setState(state => ({ ...state, negate: false }))
  }, [state.negate, setState])

  const handleMouseMove = useCallback(event => {
    const { start, offset, offsetRect } = state
    if (!start) {
      return
    }

    const { shiftKey, altKey, clientX, clientY } = event
    const [x0, y0] = start

    const x = clamp(clientX, offsetRect.left, offsetRect.right)
    const y = clamp(clientY, offsetRect.top, offsetRect.bottom)

    const rect = [
      [Math.min(x, x0) - offset[0], Math.min(y, y0) - offset[1]],
      [Math.max(x, x0) - offset[0], Math.max(y, y0) - offset[1]]
    ]
    const size = [
      Math.abs(x - x0),
      Math.abs(y - y0)
    ]

    setState(state => ({
      ...state,
      negate: shiftKey || altKey,
      selecting: size[0] > 3 || size[1] > 3,
      intersecting: getIntersectingPolygons(rect, polygons),
      rect,
      size
    }))
  }, [state, polygons, setState])

  const handleMouseUp = useCallback(event => {
    if (state.start) {
      if (state.selecting) {
        onSelect({
          negate: state.negate,
          intersecting: state.intersecting
        })
      }

      setState({ start: null, selecting: false })
    }
  }, [onSelect, state, setState])

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleMouseUp, handleMouseMove, handleKeyDown, handleKeyUp])

  return [{
    ...state,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove
  }, DragSelectContainer]
}

function getRelativeAncestor (element) {
  // This isn't great. Iterating through ancestors is not ideal, having to check
  // the height of the bounding client rect because I know that one of them is
  // not going to give me the desired result is worse. This is less appropriate
  // than using a ref, but I don't like passing it back from the hook as its
  // "context" in order to pass it to the rendered component.
  // Most likely this whole component should be a wrapper of the placed keys and
  // using cloneElement or something, I don't know.
  while (
    (element = element.parentNode) &&
    (element.style.position !== 'relative' || !element.getBoundingClientRect().height)
  );

  return element
}

function getIntersectingPolygons (rect, polygons) {
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
