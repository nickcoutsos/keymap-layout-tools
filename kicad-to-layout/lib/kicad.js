/**
 * Parse switches from a `kicad_pcb` file to generate a layout.
 * Inspired by https://gist.github.com/crides/6d12d1033368e24873b0142941311e5d
 */
import { getLayoutBoundingRect } from 'keymap-layout-tools/lib/geometry.js'
import * as modifiers from 'keymap-layout-tools/lib/modifiers.js'
import { and, or, nameIs } from './util.js'
import Parse from 's-expression'

export const DEFAULT_MODULE_PATTERN = '.*'
export const DEFAULT_SWITCH_PATTERN = '^(S(WL?)?|MX|K.+?)\\d+'

export const SPACING_MX = { x: 19, y: 19 }
export const SPACING_CHOC = { x: 18, y: 17 }

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
    layout = modifiers.mirror(layout, { gap: options.mirrorGap })
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
 * @param {Object} options
 * @param {String|RegExp} options.modulePattern
 * @param {String|RegExp} options.switchPattern
 * @param {boolean} options.inferKeySize
 * @returns {Array<ParsedSwitch>}
 */
export function getSwitches (tree, options) {
  const positionMatcher = nameIs('at')
  const switchTextMatcher = and(
    or(nameIs('fp_text'), nameIs('property')),
    node => (
      node[1].toLowerCase() === 'reference' &&
      node[2].match(options.switchPattern || DEFAULT_SWITCH_PATTERN)
    )
  )

  return tree
    .filter(and(
      or(nameIs('module'), nameIs('footprint')),
      node => node[1].match(options.modulePattern || DEFAULT_MODULE_PATTERN)
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
          },
          size: (
            options.inferKeySize
              ? sizeFromModuleName(mod[1].toString())
              : { u: 1, h: 1 }
          )
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
}

function sizeFromModuleName (name) {
  return {
    u: Number(name.match(/(\d+(\.\d+)?)u/i)?.[1]) || 1,
    h: Number(name.match(/(\d+(\.\d+)?)h/i)?.[1]) || 1
  }
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
    let { u, h } = sw.size
    const prev = keys.at(i - 1)

    if (prev && x < prev.x) {
      row += 1
      col = 0
    }

    const angleFromVertical = sw.angle > 180 ? 360 - sw.angle : sw.angle
    if (angleFromVertical > 45) {
      [u, h] = [h, u]
    }

    const key = {
      row,
      col: col++,
      r: 0,
      x, y,
      u, h
    }

    if (u > 1) key.x -= (u - 1) / 2
    if (h > 1) key.y -= (h - 1) / 2

    if (sw.angle) {
      // From the kicad file format docs:
      // (https://dev-docs.kicad.org/en/file-formats/sexpr-intro/)
      // > Symbol text ANGLEs are stored in tenth’s of a degree. All other
      // > ANGLEs are stored in degrees.
      // Note: I don't know what specifically a text angle is and haven't seen
      // an example of it in any keyboard's kicad files.

      // Try to orient keys to face "North". Switch rotations matter on the PCB
      // but for presentational purposes we can rotate 90 degree increments to
      // better align text with the horizontal axis.
      key.r = -(sw.angle % 90)
      if (Math.abs(key.r) > 45) {
        key.r -= 90 * Math.sign(key.r)
      }
    }

    // Rotation origins are generally weird. KLE's rotations always default to
    // the canvas origin, QMK's rotations default to the key's top-left corner.
    // Kicad rotations are around the component's center point so we need to
    // make that explicit here.
    if (key.r) {
      key.rx = key.x + key.u / 2
      key.ry = key.y + key.h / 2
    } else {
      delete key.r
      delete key.rx
      delete key.ry
    }

    if (key.u === 1) delete key.u
    if (key.h === 1) delete key.h

    return [...keys, key]
  }, [])
}
