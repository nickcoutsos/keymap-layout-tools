import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import SelectableLayout from './Common/SelectableLayout.jsx'
import TranslationHelper from './LayoutHelpers/Translation/TranslationHelper.jsx'
import {
  selectActiveTool,
  selectKeySelection,
  updateKeySelection,
  updateMetadata
} from './metadataSlice.js'

export default function TextualLayout ({ layout: original }) {
  const dispatch = useDispatch()
  const selectedKeys = useSelector(selectKeySelection)
  const layout = useMemo(() => {
    return original.map(({ row, col }) => ({
      x: col,
      y: row
    }))
  }, [original])

  const activeTool = useSelector(selectActiveTool)

  const handleTranslation = useCallback(layout => {
    dispatch(updateMetadata({
      keepSelection: true,
      layout: original.map((layoutKey, i) => (
        selectedKeys.includes(i)
          ? { ...layoutKey, row: layout[i].y, col: layout[i].x }
          : layoutKey
      ))
    }))
  }, [dispatch, original, selectedKeys])

  return (
    <SelectableLayout
      layout={layout}
      scale={0.5}
      selection={selectedKeys}
      onUpdate={keys => dispatch(updateKeySelection({ keys }))}
      onHover={() => {}}
      renderOverlay={(layout, original) => (
        <>
          {activeTool === 'translation' && (
            <TranslationHelper
              layout={layout}
              original={original}
              scale={0.5}
              step={1}
              keyIndices={selectedKeys}
              onUpdate={handleTranslation}
            />
          )}
        </>
      )}
    />
  )
}
