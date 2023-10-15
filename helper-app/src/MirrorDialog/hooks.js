import { flip, mirror } from 'keymap-layout-tools/lib/modifiers'
import { useMemo } from 'react'

export function useMirrorTransform (initialLayout, options) {
  const layout = useMemo(() => (
    options.invert ? flip(initialLayout) : initialLayout
  ), [initialLayout, options.invert])

  const mirrored = useMemo(() => (
    mirror(layout, { gap: options.gap, referenceOriginal: true })
  ), [layout, options.gap])

  // const mapping = useMemo(() => {}, [mirrored])

  return { mirrored }
}
