// WIP
// This is the basic code to generate an SVG path for a `clip-path` shape of an
// ISO enter key. This should probably reference geometry.js for key sizing and
// padding.
const base = 70
const padding = 5
const u_ = 1.5
const h_ = 2

const w = u_ * base - padding
const h = h_ * base - padding
const r = 4

const x2 = 0.25 * base
const y2 = 1 * base - padding

const points = [
  [0, 0],
  [w, 0],
  [w, h],
  [x2, h],
  [x2, y2],
  [0, y2]
]

// Given an array of corners this generates a path where each segment stops
// short of the target and uses an "arc to" directive to make that corner
// rounded. This seems to work okay (only tested in Firefox) but the first
// segment is actually drawing a line from 0,0 to 0,-r and then arcing to r,0.
const path2 = points.flatMap(function ([x, y], i, arr) {
  const [x0, y0] = arr.at(i - 1)
  const [x2, y2] = arr.at(i + 1) || arr[0]
  const [dx, dy] = [x - x0, y - y0]
  const [d2x, d2y] = [x2 - x, y2 - y]
  const cross = dx * d2y - d2x * dy

  const a = `L ${x - Math.sign(dx) * r} ${y - Math.sign(dy) * r}`
  const b = `A ${r} ${r} 0 0 ${cross > 0 ? 1 : 0} ${x + Math.sign(d2x) * r} ${y + Math.sign(d2y) * r}`

  return [a, b]
})

export default function IsoEnterKey () {

}
