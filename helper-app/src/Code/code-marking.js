import { EditorView, Decoration } from '@codemirror/view'
import { StateField, StateEffect } from '@codemirror/state'
import { useEffect } from 'react'

import { useSelectedRanges } from './json-ast/hook.js'

const markDecoration = Decoration.mark({ class: 'mark-highlighter' })

export const addMark = StateEffect.define()

export const markField = StateField.define({
  create () {
    return Decoration.none
  },
  update (underlines, tr) {
    underlines = underlines.map(tr.changes)
    for (const e of tr.effects) {
      if (e.is(addMark)) {
        underlines = underlines.update({
          add: [markDecoration.range(e.value.from, e.value.to)]
        })
      }
    }
    return underlines
  },
  provide: f => EditorView.decorations.from(f)
})

export const markTheme = EditorView.baseTheme({
  '.mark-highlighter': {
    backgroundColor: 'rgba(255, 230, 0, 0.35)'
  }
})

export function useCodeMarking (docRef) {
  const selectedRanges = useSelectedRanges()

  // useEffect(() => {
  //   const view = doc.current?.view
  //   if (!view || !selectedRanges.length) {
  //     return
  //   }
  //   const ranges = selectedRanges.map(([start, end]) => EditorSelection.range(start, end))
  //   const selection = EditorSelection.create(ranges)
  //   view.dispatch({ selection })
  // }, [selectedRanges])

  useEffect(() => {
    const view = docRef.current?.view
    if (!view || !selectedRanges.length) {
      return
    }

    const effects = selectedRanges.map(mapping => (
      addMark.of({
        from: mapping.start,
        to: mapping.end
      })
    ))

    if (!view.state.field(markField, false)) {
      effects.push(
        StateEffect.appendConfig.of([markField, markTheme]),
        EditorView.scrollIntoView(selectedRanges[0].start)
      )
    }

    view.dispatch({ effects })
  }, [docRef, selectedRanges])
}
