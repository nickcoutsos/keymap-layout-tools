/**
 * Parse switches from a `kicad_pcb` file to generate a layout.
 * Inspired by https://gist.github.com/crides/6d12d1033368e24873b0142941311e5d
 */
import { getLayoutBoundingRect } from 'keymap-layout-tools/lib/geometry.js'
import * as modifiers from 'keymap-layout-tools/lib/modifiers.js'
import Parse from 's-expression'

/**
 * @typedef {Object} LayoutKey
 * @property {Number} x - graphical position
 * @property {Number} y - graphical position
 * @property {BigInt} row - textual position
 * @property {BigInt} col - textual position
 * @property {Number} [u=1] - key width
 * @property {Number} [h=1] - key height
 * @property {Number} [r=0] - rotation angle
 * @property {Number} [rx] - rotation origin x
 * @property {Number} [ry] - rotation origin y
 */

/**
 * @typedef {Object} ParsedSwitch
 * @property {String} name
 * @property {Object} position
 * @property {Number} position.x
 * @property {Number} position.y
 * @property {Number} [angle]
 */

/**
 * Parse kicad pcb to generate a S-Expression tree
 * @param {String} pcbFileContents
 * @returns {Array}
 */
export function parsePcbTree (pcbFileContents) {
  return Parse(pcbFileContents)
}

/**
 * Parse kicad pcb to generate a layout
 * @param {String} pcbFileContents
 * @param {Object} options
 * @param {}
 * @returns {Array<LayoutKey>}
 */
export function parseKicadLayout (pcbFileContents, options) {
  const tree = parsePcbTree(pcbFileContents)
  const switches = getSwitches(tree, options)
  let layout = generateLayout(switches, options)

  if (options.invert) {
    layout = modifiers.flip(layout)
  }
  if (options.mirror) {
    layout = modifiers.mirror(layout, { gap: 2 })
  }

  // Rotation origins are generally weird. KLE's rotations always default to the
  // canvas origin, QMK's rotations default to the key's top-left corner. Kicad
  // rotations are around the component's center point so we need to make that
  // explicit here.
  // This was originally happening earlier in the `generateLayout` function but
  // that impacts the flip/mirror logic because the key's origin is the top-left
  // corner, which means the center is define relative to that point. When the
  // layout gets flipped it would put the "center" outside the key.
  for (const key of layout) {
    if (key.r) {
      key.rx = key.x + .5
      key.ry = key.y + .5
    }
  }

  const bbox = getLayoutBoundingRect(layout, { keySize: 1, padding: 0 })
  for (const key of layout) {
    key.x -= bbox.min.x
    key.y -= bbox.min.y
  }

  return layout
}

/**
 * 
 * @param {Array} tree
 * @returns {Array<ParsedSwitch>}
 */
export function getSwitches (tree, options) {
  const getSwitchNum = sw => Number(sw.name.match(/^SW?(\d+)/)?.[1])
  const and = (...predicates) => value => predicates.every(predicate => predicate(value))
  const or = (...predicates) => value => predicates.some(predicate => predicate(value))

  const nameIs = name => value => Array.isArray(value) && value[0] === name
  const positionMatcher = nameIs('at')
  const switchTextMatcher = and(
    nameIs('fp_text'),
    // TODO: Make these patterns configurable like/instead of modulePattern?
    node => node[1] === 'reference' && (
      node[2].match(/^S(WL?)?\d+/) ||
      node[2].match(/^MX\d+/) ||
      node[2].match(/^K.+?\d+$/)
    )
  )

  return tree
    .filter(and(
      or(nameIs('module'), nameIs('footprint')),
      node => node[1].match(options.modulePattern)
    ))
    .reduce((switches, mod) => {
      const at = mod.find(positionMatcher)
      const fpText = mod.find(switchTextMatcher)

      if (fpText) {
        const sw = {
          mod: mod[1].toString(),
          name: fpText[2].toString(),
          angle: Number(at[3] || 0),
          position: {
            x: Number(at[1]),
            y: Number(at[2])
          }
        }

        if (!switches.some(prev => (
          prev.position.x === sw.position.x &&
          prev.position.y === sw.position.y
        ))) {
          switches.push(sw)
        }
      }

      return switches
    }, [])
    .sort((a, b) => getSwitchNum(a) - getSwitchNum(b))
}

/**
 * Use key position/angle to create physical/textual layout data.
 * @param {Array<ParsedSwitch>} switches
 * @returns {Array<LayoutKey>}
 */
export function generateLayout (switches, options) {
  const min = switches.map(sw => sw.position).reduce((a, b) => ({
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y)
  }), { x: Infinity, y: Infinity })

  let row = 0
  let col = 0

  return switches.reduce((keys, sw, i) => {
    let x = Number(sw.position.x - min.x) / options.spacing.x
    let y = Number(sw.position.y - min.y) / options.spacing.y
    const prev = keys.at(i - 1)

    if (prev && x < prev.x) {
      row += 1
      col = 0
    }

    const key = {
      row,
      col: col++,
      r: 0,
      x, y
    }

    if (sw.angle) {
      // From the kicad file format docs:
      // (https://dev-docs.kicad.org/en/file-formats/sexpr-intro/)
      // > Symbol text ANGLEs are stored in tenth’s of a degree. All other
      // > ANGLEs are stored in degrees.
      // Note: I don't know what specifically a text angle is and haven't seen
      // an example of it in any keyboard's kicad files.
      key.r = -sw.angle
      if (Math.abs(sw.angle) > 150 && Math.abs(sw.angle) < 210) {
        key.r += Math.sign(sw.angle) * 180
      }
    }

    return [...keys, key]
  }, [])
}
