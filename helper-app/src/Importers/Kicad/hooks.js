import { useMemo } from 'react'

import {
  parsePcbTree,
  getSwitches,
  generateLayout,
  SPACING_CHOC,
  SPACING_MX,
  DEFAULT_MODULE_PATTERN,
  DEFAULT_SWITCH_PATTERN
} from 'kicad-to-layout'
import { and, nameIs, or } from 'kicad-to-layout/lib/util.js'

import {
  toOrigin,
  flip,
  mirror,
  setFixedPrecision
} from 'keymap-layout-tools/lib/modifiers.js'

export function useKicadImporter (contents, options) {
  const tree = useMemo(() => (
    contents && parsePcbTree(contents)
  ), [contents])

  const patterns = useMemo(() => {
    let modulePattern
    let switchPattern
    try {
      modulePattern = new RegExp(options.modulePattern)
    } catch {}
    try {
      switchPattern = new RegExp(options.switchPattern)
    } catch {}

    return {
      modulePattern,
      switchPattern
    }
  }, [options])

  const components = useMemo(() => {
    if (!tree) {
      return null
    }

    return tree
      .filter(or(nameIs('module'), nameIs('footprint')))
      .map(mod => {
        const name = mod[1].constructor === String ? mod[1].toString() : undefined
        const description = mod.find(nameIs('descr'))?.[1].toString()
        const ref = mod.find(and(
          nameIs('fp_text'),
          node => node[1] === 'reference')
        )?.[2].toString()

        return {
          name,
          description,
          ref,
          match: (
            name.match(patterns.modulePattern || DEFAULT_MODULE_PATTERN) &&
            ref.match(patterns.switchPattern || DEFAULT_SWITCH_PATTERN)
          )
        }
      })
  }, [tree, patterns])

  const switches = useMemo(() => {
    if (!tree) {
      return null
    }

    return getSwitches(tree, patterns)
  }, [tree, patterns])

  const spacing = useMemo(() => (
    options.choc
      ? SPACING_CHOC
      : SPACING_MX
  ), [options.choc])

  const rawLayout = useMemo(() => (
    switches && generateLayout(switches, { spacing })
  ), [switches, spacing])

  const layout = useMemo(() => {
    if (!rawLayout) {
      return null
    }

    let layout = rawLayout
    if (options.invert) {
      layout = flip(layout, { referenceOriginal: true })
    }
    if (options.mirror) {
      layout = mirror(layout, { referenceOriginal: true, gap: 2 })
    }

    return setFixedPrecision(toOrigin(layout))
  }, [rawLayout, options.invert, options.mirror])

  return useMemo(
    () => ({ components, switches, layout }),
    [components, switches, layout]
  )
}
