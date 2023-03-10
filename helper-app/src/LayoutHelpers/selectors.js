import pick from 'lodash/pick'

export const getPosition = keyLayout => pick(keyLayout, ['x', 'y'])

export const getRotation = keyLayout => {
  const { rx, ry, r } = keyLayout
  return { x: rx, y: ry, a: r }
}

export const getSize = keyLayout => {
  const { w = 1, u = w, h = 1 } = keyLayout
  return { u, h }
}
