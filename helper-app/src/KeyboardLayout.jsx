import classNames from 'classnames'
import isEqual from 'lodash/isEqual'
import pick from 'lodash/pick'
import PropTypes from 'prop-types'
import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Layout from './Common/Layout.jsx'
import RotationOriginHelper from './LayoutHelpers/RotationOriginHelper.js'
import * as keyboardLayoutPropTypes from './keyboardLayoutPropTypes'
import Key from './Key.jsx'
import styles from './styles.module.css'
import {
  updateKeySelection,
  selectKeySelection
} from './metadataSlice.js'

function matchRotations (keyA, keyB) {
  return isEqual(
    pick(keyA, ['r', 'rx', 'ry']),
    pick(keyB, ['r', 'rx', 'ry'])
  )
}

function KeyboardLayout (props) {
  const { layout, scale } = props
  const [hovering, setHovering] = useState(null)
  const dispatch = useDispatch()
  const selectedKeys = useSelector(selectKeySelection)

  const rotating = hovering !== null && !!layout[hovering].r && (
    layout.reduce((acc, keyLayout, index) => {
      if (matchRotations(keyLayout, layout[hovering])) {
        acc.push({ index, keyLayout })
      }

      return acc
    }, [])
  )

  const toggleSelection = useCallback((event, index) => {
    event.preventDefault()
    event.stopPropagation()
    dispatch(updateKeySelection({
      keys: selectedKeys.includes(index) ? [] : [index],
      append: event.shiftKey
    }))
  }, [selectedKeys, dispatch])

  return (
    <>
      <Layout
        layout={layout}
        scale={scale}
        renderKey={({ keyLayout, index }) => (
          <Key
            index={index}
            keyLayout={keyLayout}
            className={classNames({
              [styles.selected]: selectedKeys.includes(index)
            })}
            onMouseEnter={() => setHovering(index)}
            onMouseLeave={() => setHovering(null)}
            onClick={event => toggleSelection(event, index)}
          />
        )}
        renderOverlay={(layout) => (
          rotating && rotating.map(({ index }) => (
            <RotationOriginHelper
              key={index}
              showArc={index === hovering}
              keyLayout={layout[index]}
            />
          ))
        )}
      />
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
