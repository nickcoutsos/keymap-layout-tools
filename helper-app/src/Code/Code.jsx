import { useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'

import useDarkModePreference from '../hooks/use-dark-mode-preference.js'
import styles from './styles.module.css'
import {
  updateMetadata,
  selectMetadata
} from '../metadataSlice.js'

const jsonExtension = json()

export default function Code () {
  const doc = useRef()
  const { text, errors } = useSelector(selectMetadata)
  const dispatch = useDispatch()
  const isDarkMode = useDarkModePreference()

  const handleEdit = useCallback(text => {
    dispatch(updateMetadata({ text }))
  }, [dispatch])

  return (
    <>
      <CodeMirror
        ref={doc}
        value={text}
        style={{ overflow: 'auto' }}
        theme={isDarkMode ? 'dark' : 'light'}
        width="460px"
        onChange={handleEdit}
        extensions={[jsonExtension]}
      />
      {errors.length > 0 && (
        <div className={styles.error}>
          <ol>
            {errors.map((error, i) => (
              <li key={i}>
                {error}
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  )
}
