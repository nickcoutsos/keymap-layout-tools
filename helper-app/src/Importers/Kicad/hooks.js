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

export function useKicadImporter (contents, rawOptions) {
  const tree = useMemo(() => (
    contents && parsePcbTree(contents)
  ), [contents])

  const options = useMemo(() => {
    let { modulePattern, switchPattern } = rawOptions
    try {
      modulePattern = new RegExp(modulePattern)
    } catch {}
    try {
      switchPattern = new RegExp(switchPattern)
    } catch {}

    return {
      ...rawOptions,
      modulePattern,
      switchPattern
    }
  }, [rawOptions])

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
          or(nameIs('fp_text'), nameIs('property')),
          node => node[1].toLowerCase() === 'reference')
        )?.[2].toString()

        return {
          name,
          description,
          ref,
          match: (
            name.match(options.modulePattern || DEFAULT_MODULE_PATTERN) &&
            ref.match(options.switchPattern || DEFAULT_SWITCH_PATTERN)
          )
        }
      })
  }, [tree, options])

  const switches = useMemo(() => {
    if (!tree) {
      return null
    }

    return getSwitches(tree, options)
  }, [tree, options])

  const spacing = useMemo(() => {
    switch (options.switchSpacing) {
      case 'choc':
        return SPACING_CHOC
      case 'mx':
        return SPACING_MX
      case 'custom':
        return {
          x: options.customSpacingX,
          y: options.customSpacingY
        }
      default:
        return SPACING_MX
    }
  }, [
    options.switchSpacing,
    options.customSpacingX,
    options.customSpacingY
  ])

  const rawLayout = useMemo(() => (
    switches && generateLayout(switches, { spacing })
  ), [switches, spacing])

  const layoutWithMetadata = useMemo(() => {
    if (!rawLayout) {
      return null
    }

    let layout = rawLayout
    if (options.invert) {
      layout = flip(layout, { referenceOriginal: true })
    }
    if (options.mirror) {
      layout = mirror(layout, {
        referenceOriginal: true,
        gap: options.mirrorGap
      })
    }

    return setFixedPrecision(toOrigin(layout))
  }, [rawLayout, options.invert, options.mirror, options.mirrorGap])

  const layout = useMemo(() => {
    if (!layoutWithMetadata) {
      return null
    }

    return layoutWithMetadata.map(key => {
      const cleaned = { ...key }
      delete cleaned._original
      delete cleaned._duplicate
      return cleaned
    })
  }, [layoutWithMetadata])

  return useMemo(
    () => ({ components, switches, layout, layoutWithMetadata }),
    [components, switches, layout, layoutWithMetadata]
  )
}
