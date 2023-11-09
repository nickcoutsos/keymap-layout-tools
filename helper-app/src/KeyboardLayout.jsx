import isEqual from 'lodash/isEqual'
import pick from 'lodash/pick'
import PropTypes from 'prop-types'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import RotationOriginHelper from './LayoutHelpers/RotationOriginHelper.js'
import * as keyboardLayoutPropTypes from './keyboardLayoutPropTypes'
import {
  updateKeySelection,
  selectKeySelection,
  updateMetadata
} from './metadataSlice.js'
import SelectableLayout from './Common/SelectableLayout.jsx'
import TranslationHelper from './LayoutHelpers/Translation/TranslationHelper.jsx'
import styles from './styles.module.css'

function matchRotations (keyA, keyB) {
  return isEqual(
    pick(keyA, ['r', 'rx', 'ry']),
    pick(keyB, ['r', 'rx', 'ry'])
  )
}

function KeyboardLayout (props) {
  const { layout, scale } = props
  const [hovering, setHovering] = useState(null)
  const [gizmo, setGizmo] = useState(null)
  const dispatch = useDispatch()
  const selectedKeys = useSelector(selectKeySelection)

  useEffect(() => {
    function listener (event) {
      if (
        event.repeat ||
        ['SELECT', 'TEXTAREA', 'INPUT'].includes(event.target.nodeName) ||
        event.target.contentEditable === 'true'
      ) {
        return
      }

      if (event.key === 'm') {
        setGizmo(gizmo => gizmo === 'translation' ? null : 'translation')
      }
    }

    document.addEventListener('keydown', listener)
    return () => document.removeEventListener('keydown', listener)
  }, [setGizmo])

  useEffect(() => {
    if (selectedKeys.length === 0) {
      setGizmo(null)
    }
  }, [selectedKeys, setGizmo])

  const rotating = hovering !== null && !!layout[hovering].r && (
    layout.reduce((acc, keyLayout, index) => {
      if (matchRotations(keyLayout, layout[hovering])) {
        acc.push({ index, keyLayout })
      }

      return acc
    }, [])
  )

  const handleSelectionUpdate = useCallback(keys => {
    dispatch(updateKeySelection({ keys }))
  }, [dispatch])

  const handleTranslation = useCallback(layout => {
    dispatch(updateMetadata({ layout, keepSelection: true }))
  }, [dispatch])

  return (
    <>
      <SelectableLayout
        layout={layout}
        scale={scale}
        selection={selectedKeys}
        onUpdate={handleSelectionUpdate}
        onHover={setHovering}
        renderOverlay={(layout, original) => (
          <>
            {rotating && rotating.map(({ index }) => (
              <RotationOriginHelper
                key={index}
                showArc={index === hovering}
                keyLayout={layout[index]}
              />
            ))}

            {gizmo === 'translation' && (
              <TranslationHelper
                layout={layout}
                original={original}
                scale={scale}
                keyIndices={selectedKeys}
                onUpdate={handleTranslation}
              />
            )}
          </>
        )}
      />
      <p className={styles.usageGuide}>
        Click or drag-select keys to highlight their corresponding JSON
        definitions. Hold <kbd>Shift</kbd> to add keys to the current selection,
        or hold <kbd>Alt</kbd> to remove keys from the current selection.
      </p>
    </>
  )
}

KeyboardLayout.propTypes = {
  layout: keyboardLayoutPropTypes.layout.isRequired,
  renderKey: PropTypes.func.isRequired,
  scale: PropTypes.number
}

KeyboardLayout.defaultProps = {
  scale: 1
}

export default KeyboardLayout
