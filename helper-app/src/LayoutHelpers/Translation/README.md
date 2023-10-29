# Translation Helper (⚠️ work in progress)

## Purpose

For a selection of keys this helper will display a "gizmo" to apply x- or y-axis
translations to those keys as a batch. This should reduce the tedium of applying
the same row or column stagger to a number of keys one at a time.

## What works

Right now you can select one or more keys and use the gizmo to start translating
them. While dragging you can see a live visualization of the keys in their new
positions, and on release the mouse button the layout itself will be updated.

## What needs work

### Better styling of live visualization

There are now a few places where I need to show a "preview" or "ghost" version
of keys undergoing some change. I need to put these styles in one place and use
them consistently

### Handling translation into negative `x` or `y`

Right now shifting keys below `x=0` or `y=0` seems to impact the exsiting drag
selection. This may be solved by implicitly normalizing the layout, I'll have to
review the problem more carefully.

### Local vs global?

Because translation currently affects only the `x` and `y` properties, weird
things will happen to keys that also have rotations. I need to decide if and how
to handle such a situation.

- Should the rotation origin be shifted as well?
- Should the user be able to switch between contexts and choose either behavior?

### Refactor some of the layout geometry stuff

The rendered layout applies some extra info to the raw layout data:

- scale (applied at the CSS level)
- key size
- key padding

Mostly the app just uses defaults unless there some math to be done that doesn't
end up using visual representation. In this case we're dealing with screen-space
interactions so the `scale` is needed to normalize overall mouse movement into
the layout geometry, and then the key size is needed to convert that into the
unitless dimensions of the original layout data.

Most likely the `Layout` component should provide the options used in the form
of a context that descendent components/hooks can reference.

## Additional features

### Support snapping translation to .5u, .25u, .1u increments

This could be as simple as holding some combination of <kbd>shift</kbd>,
<kbd>control</kbd>, or <kbd>alt</kbd> keys maybe.

### Don't apply translation to layout immediately?
- Add numeric input fields and allow user to enter precise offset(s)
- Let user decide local or global

### Show a grid?

I have a `GridHelper` overlay component (not committed yet) that shows a grid
of lines spaced 1u apart. Should the grid be aligned to the canvas origin, to
the corner of the selection, or to the center? I think without the correct frame
of reference the grid may not be that helpful.
