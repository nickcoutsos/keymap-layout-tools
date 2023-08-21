import clamp from 'lodash/clamp.js'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { bbox, bboxUnion } from 'keymap-layout-tools/lib/geometry'

import {
  getRelativeAncestor,
  getIntersectingPolygons
} from './util'

export function useDragSelector ({ polygons, onSelect }) {
  const [state, setState] = useState({
    mode: 'box'
  })

  const boundingBox = useMemo(() => {
    return polygons.map(bbox).reduce(bboxUnion)
  }, [polygons])

  const handleMouseDown = useCallback(event => {
    const offsetElement = getRelativeAncestor(event.target)
    const rect = offsetElement.getBoundingClientRect()
    const { clientX: x, clientY: y } = event

    event.preventDefault()
    setState({
      start: [x, y],
      trail: [],
      intersecting: [],
      offset: [rect.left, rect.top],
      offsetRect: rect
    })
  }, [setState])

  const handleChangeMode = useCallback(mode => (
    setState(state => ({ ...state, mode }))
  ), [setState])

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
      trail: [...state.trail, [x - offset[0], y - offset[1]]],
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

  return {
    ...state,
    boundingBox,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onChangeMode: handleChangeMode
  }
}
