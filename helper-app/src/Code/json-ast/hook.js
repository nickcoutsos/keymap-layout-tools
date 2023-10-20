import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import {
  selectActiveLayout,
  selectLayoutNames,
  selectKeySelection,
  selectMetadata
} from '../../metadataSlice'
import { getTextMapping } from './json-ast'

function useTextMapping () {
  const [textMapping, setTextMapping] = useState([])
  const { text } = useSelector(selectMetadata)

  useEffect(() => {
    getTextMapping(text).then(setTextMapping)
  }, [text])

  return textMapping
}

export function useSelectedRanges () {
  const textMapping = useTextMapping()
  const selectedKeys = useSelector(selectKeySelection)
  const layoutNames = useSelector(selectLayoutNames)
  const activeLayout = useSelector(selectActiveLayout)
  const activeLayoutIndex = Math.max(0, layoutNames.indexOf(activeLayout))

  return selectedKeys.map(index => textMapping[activeLayoutIndex][index])
}
