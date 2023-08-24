# Kicad-to-layout



This is a small javascript utility to parse a `.kicad_pcb` file to get a list of
switch locations and orientations, and generate a layout suitable for rendering
with other tools in this repo.

It is based heavily on the snippet [layout.py] by [crides].

I started by using [kicad-utils] but it is several years old and consequently a
number of keyboard PCBs I've tested can't be parsed. Kicad PCBs are composed of
big _s-expression_ trees so it seemed better to have a simple generic parser
that I can query with as much specificity as needed.

## Usage

_In addition to the CLI you can also use it interactively via the Keymap Layout
Tools [helper app](https://nickcoutsos.github.io/keymap-layout-tools/)._

```
node ./bin/kicad-to-layout.js
Positionals:
  path  Path to kicad_pcb file

Options:
  --invert-x        Flip layout data along X axis     [boolean] [default: false]
  --mirror-x        Mirror layout along X axis (to produce a full keyboard from
                    a single PCB of a symmetric split).
                                                      [boolean] [default: false]
  --preview         Render the generated layout in terminal using Unicode
                    braille dots.                     [boolean] [default: false]
  --choc            Interpret switch positioning based on kailh choc key spacing
                    (18.5mm x 17.5mm).                [boolean] [default: false]
  --module-pattern  PCRE regex pattern to apply to module/footprints being
                    considered for key switches. This can be used to be more
                    specific where power/reset switches otherwise follow the
                    same naming pattern as keys.                 [default: ".*"]
  --help            Show help                                          [boolean]
```

### Example:

```
$ node ./bin/kicad-to-layout.js samples/osprette.kicad_pcb --preview --choc --module-pattern=keyswitches

⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣶⣶⣤⣀⠀⢀⣶⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣴⣶⣆⠀⣀⣤⣶⣶⣦
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⣿⡟⢀⣾⣿⣿⣿⣿⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠰⣿⣿⣿⣿⣿⣆⢻⣿⣿⣿⣿⣧
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡈⠙⠻⢿⣿⠃⣘⠻⢿⣿⣿⠃⢀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣄⠹⣿⣿⣿⠿⣋⠀⢻⣿⠿⠛⣁⣀
⠀⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣿⣷⣦⣄⠀⣼⣿⣿⣶⣬⠁⢀⣾⣿⣿⣷⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣾⣿⣿⣿⣧⠀⢩⣶⣿⣿⣷⡀⢰⣾⣿⣿⣿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡀
⠀⣼⣿⣿⣶⣤⠀⣼⣿⣶⣤⣀⠀⠀⣾⣿⣿⣿⣿⠃⣼⣿⣿⣿⣿⠏⠀⣾⣿⣿⣿⣿⠃⣼⣿⣶⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣴⣶⣿⣷⡈⢿⣿⣿⣿⣿⠃⢻⣿⣿⣿⣿⣷⠈⢿⣿⣿⣿⣿⠃⠀⣀⣤⣶⣿⣧⠀⣠⣶⣿⣿⣷⡀
⣼⣿⣿⣿⣿⠏⣼⣿⣿⣿⣿⡿⠁⣴⣦⣍⡛⠿⠃⢀⣌⡙⠻⢿⠏⠀⣴⣤⣉⠛⠿⠃⣼⣿⣿⣿⣿⠏⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⣿⣿⣿⣷⠈⠛⢋⣩⣴⣶⣆⠻⠿⠛⢛⣩⣤⠈⠻⢟⣫⣵⣦⡀⢻⣿⣿⣿⣿⣧⠹⣿⣿⣿⣿⣷
⠀⠉⠛⠿⠏⢀⣌⡙⠻⢿⡿⠁⣼⣿⣿⣿⣿⠇⢀⣾⣿⣿⣷⣦⠀⣼⣿⣿⣿⣿⠆⣠⣌⡙⠻⢿⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⢿⡿⢟⣫⣄⠰⣿⣿⣿⣿⣿⣆⢰⣾⣿⣿⣿⣧⠰⣿⣿⣿⣿⣷⡀⠻⣿⠿⣛⣥⣀⠹⠿⠟⠋⠁
⠀⠀⠀⠀⢀⣾⣿⣿⣷⣦⠀⠈⠛⠿⣿⣿⠏⠀⠾⣿⣿⣿⣿⠃⠘⠻⢿⣿⣿⠏⣰⣿⣿⣿⣷⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣾⣿⣿⣿⣧⠹⣿⣿⣿⠿⠋⠀⢻⣿⣿⣿⡿⠃⠹⣿⣿⣿⠿⠃⠀⢰⣿⣿⣿⣿⣧
⠀⠀⠀⠀⣾⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠉⠀⠀⠀⠀⠉⠛⠃⣼⣿⣶⣤⣈⠉⠰⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⣿⣿⡿⠃⠉⢩⣴⣶⣿⣷⡀⠙⠋⠁⠀⠀⠀⠉⠉⠀⠀⠀⠀⠈⣿⣿⣿⣿⣿⠃
⠀⠀⠀⠀⠀⠉⠛⠿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⣿⣿⣿⠏⢀⣶⣤⣉⠙⠛⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⢋⣡⣴⣶⣆⢻⣿⣿⣿⣿⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠻⠟⠋⠁
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠻⢿⠏⢀⣾⣿⣿⣿⣿⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠰⣿⣿⣿⣿⣿⣆⠻⣿⠿⠛⠉
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣘⠻⢿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⣿⣿⣿⠿⣋
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⣿⣶⣬⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢩⣶⣿⣿⣷⡀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⣿⣿⣿⠏⢀⣶⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣴⣶⣦⢻⣿⣿⣿⣿⣷
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠛⠿⠏⢀⣾⣿⣿⣿⣿⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⣿⣿⣿⣧⠻⠿⠛⠛⠉
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠻⢿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⣿⠿⠃
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉
```

👆 Ok, so, font rendering of the braille unicode codepoints can differ. "Blank"
spaces may not have consistent widths between different text viewers.

## Disclaimer

I don't work with PCBs so I don't know of all the nuance and conventions people
use when designing keyboards. This script is a good way to get started with some
layout data, but expect to manually tweak the results afterwards.

## Limitations

**Rotation**

These are complicated enough already, but in this case there's more because the
rotation origin in Kicad is expressed as the key center (or the switch, anyway)
while compatibility with QMK/KLE layouts means origins should default to the
key's top-left corner.

Worse still, Kicad doesn't appear to have a concept of "grouping" transforms (or
if it does, it doesn't seem to be used). This means that each key in a thumb
cluster or splayed column is individually positioned and rotated about its own
rotation origin. This is an opportunity for numerical inaccuracies to build up
and cause keys to appear misaligned. The simple solution is to store more
significant digits at the cost of readability.

**Sizing**

Key sizing is not currently takend into consideration. PCBs represent switches
rather than keycaps so those dimensions aren't factored in like rotations are.

*Some* PCBs may imply a key size used for a given switch but this isn't any kind
of well-defined rule and would probably need to support a variety of patterns.
For now this will have to be corrected after import (do keep in mind the origin
issue noted above).

**Ordering**

Switch modules are often defined in arbitrary order which means this may not
produce a layout that you can just use with `keymap-editor` or `keymap-drawer`.

I'd love to automate fixes for this but different layouts -- particularly those
with extreme column stagger or inconsistent numbers of keys per-column -- can
make this impossible. For now the best option is to use the helper web app with
the new _Re-order_ feature to map each key to the appropriate row and column.


[crides]:https://github.com/crides
[layout.py]:https://gist.github.com/crides/6d12d1033368e24873b0142941311e5d
[kicad-utils]:https://www.npmjs.com/package/kicad-utils