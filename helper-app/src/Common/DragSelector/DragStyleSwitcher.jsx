import { useCallback } from 'react'
import PropTypes from 'prop-types'

import {
  DRAG_STYLE_BOX,
  DRAG_STYLE_PATH
} from './constants'

export default function DragSelectStyleSwitcher ({ style, onChangeStyle }) {
  const handleChange = useCallback(event => {
    onChangeStyle(event.target.value)
  }, [onChangeStyle])

  return (
    <div>
      <p>
        Region select style:
        <label>
          <input
            type="radio"
            name="drag-select-style"
            checked={style === DRAG_STYLE_BOX}
            onChange={handleChange}
            value="box"
          /> Box
        </label>
        <label>
          <input
            type="radio"
            name="drag-select-style"
            checked={style === DRAG_STYLE_PATH}
            onChange={handleChange}
            value="path"
          /> Freehand
        </label>
      </p>
    </div>
  )
}

DragSelectStyleSwitcher.propTypes = {
  style: PropTypes.oneOf([DRAG_STYLE_BOX, DRAG_STYLE_PATH]).isRequired,
  onChangeStyle: PropTypes.func.isRequired
}
