# Keymap Layout Tools

Helper code for dealing with rendering keyboard layouts. Right now this is
effectively a reference implementation for rendering layouts based on QMK's
`info.json` which in turn is based on KLE's format.

This repository includes a helper application to:

- dynamically render layout data for faster layout tweaks
- import layout data from other source formats (currently ZMK Devicetree, Kicad
  PCBs, and Keyboard Layout Editor JSON)
- tooling to help generate textual layouts for readable keymap code

The code is based on the layout rendering implemented in [Keymap Editor] ~which
is known to have some issues with rotation.~ (👍) Part of the reason for this
project is to make these issues and inconsistencies more apparent and make fixes
easier.

## What this isn't

This is not an app for editing your keyboard's keymap, generating a diagram of
a keymap or anything relating to actually modifying keymap data.

[Keymap Editor]: https://github.com/nickcoutsos/keymap-editor
