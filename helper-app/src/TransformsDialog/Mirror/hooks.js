import { useMemo } from 'react'

import { flip, mirror } from 'keymap-layout-tools/lib/modifiers'

export function useMirrorTransform (initialLayout, options) {
  const layout = useMemo(() => (
    options.invert ? flip(initialLayout) : initialLayout
  ), [initialLayout, options.invert])

  const mirroredWithMetadata = useMemo(() => (
    mirror(layout, { gap: options.gap, referenceOriginal: true })
  ), [layout, options.gap])

  const mirrored = useMemo(() => (
    mirroredWithMetadata.map(keyLayout => {
      const cleaned = { ...keyLayout }
      delete cleaned._original
      delete cleaned._duplicate
      return cleaned
    })
  ), [mirroredWithMetadata])

  return { mirrored, mirroredWithMetadata }
}
