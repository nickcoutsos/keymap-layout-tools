import Canvas from 'drawille-canvas'

/**
 * Rasterize a graphical layout using unicode braille glyphs
 *
 * @param {Array<import('./kicad').LayoutKey>} layout
 * @returns {String}
 */
export function render (layout) {
  const canvas = new Canvas()
  const c = canvas.getContext('2d')

  const SIZE = 12
  const SPACING = 3

  for (const layoutKey of layout) {
    const params = {
      x: layoutKey.x * (SIZE - 0),
      y: layoutKey.y * (SIZE - 0),
      u: (layoutKey.w || 1) * SIZE,
      h: (layoutKey.h || 1) * SIZE,
      rx: (layoutKey.x - (layoutKey.rx ?? layoutKey.x)) * -SIZE,
      ry: (layoutKey.y - (layoutKey.ry ?? layoutKey.y)) * -SIZE,
      r: layoutKey.r || 0
    }

    c.save()
    c.translate(params.rx + params.x, params.ry + params.y)
    c.rotate(params.r)
    c.translate(-(params.rx + params.x), -(params.ry + params.y))
    c.translate(params.x, params.y)

    c.translate(SPACING/2, SPACING/2)
    chamferedRect(
      c,
      params.u - SPACING,
      params.h - SPACING,
      SPACING/4
    )
    c.fill()
    c.restore()
  }

  return (
    c.toString()
      .split('\n')
      .map(line => line.trimEnd())
      .filter(line => line.length > 0)
      .join('\r\n')
      .replace(/ /g, '⠀')
  )
}

function chamferedRect (ctx, w, h, chamferDist) {
  const offset = Math.sqrt(Math.pow(chamferDist, 2) * 2)

  ctx.beginPath()
  ctx.moveTo(offset, 0)
  ctx.lineTo(0, offset)

  ctx.lineTo(0, h - offset)
  ctx.lineTo(offset, h)

  ctx.lineTo(w - offset, h)
  ctx.lineTo(w, h - offset)

  ctx.lineTo(w, offset)
  ctx.lineTo(w - offset, 0)
}
