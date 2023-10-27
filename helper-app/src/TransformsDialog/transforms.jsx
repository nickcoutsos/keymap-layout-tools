import Mirror from './Mirror/Mirror.jsx'
import Normalize from './Normalize/Normalize.jsx'

export const transformers = {
  mirror: {
    name: 'Mirror/Flip',
    component: Mirror,
    notes: (
      <p>
        Mirror the layout along the X-axis. Useful for tweaking symmetric
        keyboards one half at a time.
      </p>
    )
  },
  normalize: {
    name: 'Normalize',
    component: Normalize,
    notes: (
      <>
        <p>
          Translate key positions so that the layout's bounding box is aligned
          with the canvas origin. This is useful when column/row offsets or
          rotations cause keys to appear in -X or -Y space.
        </p>
        <p>
          <small>
            (This tool will usually normalize layouts anyway, but if other tools
            don't this should ensure that everything renders as expected)
          </small>
        </p>
      </>
    )
  }
}
