import { useMemo } from 'react'

import {
  parsePcbTree,
  getSwitches,
  generateLayout,
  SPACING_CHOC,
  SPACING_MX
} from 'kicad-to-layout'

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

  const switches = useMemo(() => {
    if (!tree) {
      return null
    }
    let modulePattern
    let switchPattern
    try {
      modulePattern = new RegExp(options.modulePattern)
    } catch {}
    try {
      switchPattern = new RegExp(options.switchPattern)
    } catch {}

    return getSwitches(tree, {
      modulePattern,
      switchPattern
    })
  }, [tree, options.modulePattern, options.switchPattern])

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
    () => ({ switches, layout }),
    [switches, layout]
  )
}
