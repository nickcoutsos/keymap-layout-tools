/**
 * Parse switches from a `kicad_pcb` file to generate a layout.
 * Inspired by https://gist.github.com/crides/6d12d1033368e24873b0142941311e5d
 */
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
 * 
 * @param {String} contents
 * @returns {Array<ParsedSwitch>}
 */
export function getSwitches (contents) {
  const tree = Parse(contents)
  const getSwitchNum = sw => Number(sw.name.match(/^SW?(\d+)/)?.[1])
  const and = (...predicates) => value => predicates.every(predicate => predicate(value))
  const or = (...predicates) => value => predicates.some(predicate => predicate(value))

  const nameIs = name => value => Array.isArray(value) && value[0] === name
  const positionMatcher = nameIs('at')
  const switchTextMatcher = and(
    nameIs('fp_text'),
    node => node[1] === 'reference' && node[2].match(/^SW?\d+/)
  )

  return tree
    .filter(or(nameIs('module'), nameIs('footprint')))
    .reduce((switches, mod) => {
      const at = mod.find(positionMatcher)
      const fpText = mod.find(switchTextMatcher)

      if (fpText) {
        switches.push({
          name: fpText[2],
          angle: Number(at[3] || 0),
          position: {
            x: Number(at[1]),
            y: Number(at[2])
          }
        })
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
export function generateLayout (switches) {
  const min = switches.map(sw => sw.position).reduce((a, b) => ({
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y)
  }))

  const spacing = {
    x: 18.5, y: 17.5 // TODO: parameterize this, 18.5,17.5 for choc
  }

  let row = 0
  let col = 0

  return switches.reduce((keys, sw, i) => {
    let x = Number(((sw.position.x - min.x) / spacing.x).toFixed(2))
    let y = Number(((sw.position.y - min.y) / spacing.y).toFixed(2))
    const prev = keys.at(i - 1)
  
    if (prev && x < prev.x) {
      row += 1
      col = 0
    }

    const key = {
      row,
      col: col++,
      x, y
    }

    if (sw.angle) {
      // From the kicad file format docs (https://dev-docs.kicad.org/en/file-formats/sexpr-intro/):
      // > Symbol text ANGLEs are stored in tenth’s of a degree. All other
      // > ANGLEs are stored in degrees.
      // Note: I don't know what specifically a text angle is and haven't seen
      // an example of it in any keyboard's kicad files.
      // TODO: many keyboard PCBs will have _all_ switches rotated ~180 degrees
      // because they specifically want to orient the switch that way, and not
      // because they are implying a speicific "up" direction for that key. This
      // should have an option to interpret the value on a case-by-case basis.
      key.r = 180 - sw.angle
      key.rx = x + .5
      key.ry = y + .5
    }
  
    return [...keys, key]
  }, [])
}

/**
 * Flip keys across the Y-axis.
 *
 * Use this to create the second half of a symmetric split keyboard from one
 * the PCB data for a single side.
 *
 * @param {Array<LayoutKey>} layout
 * @returns {Array<LayoutKey>}
 */
export function flip (layout) {
  const maxX = Math.max(...layout.map(k => k.x))
  const maxCol = Math.max(...layout.map(k => k.col))
  const rows = groupByRow(layout)

  return rows.flatMap(row => {
    return row.map(key => ({
      ...key,
      x: maxX - key.x,
      col: maxCol - key.col
    })).reverse()
  })
}

function groupByRow (layout) {
  return layout.reduce((rows, key) => {
    let row = rows.at(-1)
    if (!row || row.at(-1).row !== key.row) {
      row = []
      rows.push(row)
    }

    row.push(key)
    return rows
  }, [])
}

export function mirror (layout) {
  const maxX = Math.max(...layout.map(k => k.x))
  const maxCol = Math.max(...layout.map(k => k.col))

  const flipped = flip(layout)
  const flippedRows = groupByRow(flipped)

  return groupByRow(layout).flatMap((row, i) => {
    const flippedRow = flippedRows[i]
    return [
      ...row,
      ...flippedRow.map(key => ({
        ...key,
        x: key.x + maxX + 2,
        col: key.col + maxCol + 2
      }))
    ]
  })
}
