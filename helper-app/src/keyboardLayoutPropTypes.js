import PropTypes from 'prop-types'

export const position = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired
}

export const rotation = {
  a: PropTypes.number,
  rx: PropTypes.number,
  ry: PropTypes.number
}

export const dimensions = {
  u: PropTypes.number,
  h: PropTypes.number
}

export const keyLayout = PropTypes.shape({
  ...position,
  ...rotation,
  ...dimensions
})

export const layout = PropTypes.arrayOf(
  keyLayout
)
