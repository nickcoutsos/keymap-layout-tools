export function parseKleLayout (data) {
  const keyLayouts = []
  const current = { x: 0, y: 0, u: 1, h: 1, r: 0, rx: 0, ry: 0 }

  if (!Array.isArray(data[0])) {
    data.shift()
  }

  for (const row of data) {
    for (const obj of row) {
      if (typeof obj === 'string') {
        const keyLayout = { label: obj, ...current }
        if (keyLayout.u === 1) delete keyLayout.u
        if (keyLayout.h === 1) delete keyLayout.h
        if (keyLayout.r === 0) {
          delete keyLayout.r
          delete keyLayout.rx
          delete keyLayout.ry
        }

        current.x += current.u
        keyLayouts.push(keyLayout)
        current.u = 1
        current.h = 1
      } else {
        const { x = 0, y = 0, r, rx, ry, w = 1, h = 1 } = obj
        if (r !== undefined) current.r = r
        if (rx !== undefined) {
          current.rx = rx
          current.x = rx
          current.y = current.ry
        }
        if (ry !== undefined) {
          current.y = ry
          current.ry = ry
        }

        current.x += x
        current.y += y
        current.u = w
        current.h = h
      }
    }
    current.y += 1
    current.x = current.rx || 0
  }

  return keyLayouts
}
