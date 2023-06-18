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

```
    node bin/kicad-to-layout.js [options] <path>

    Options:
      --invert-x    Flip layout data along X axis

      --mirror-x    Mirror layout along X axis (to produce a full keyboard
                    from a single PCB of a symmetric split).

      --preview     Render the generated layout in terminal using Unicode
                    braille dots.

      --choc        Interpret switch positioning based on kailh choc key
                    spacing (18.5mm x 17.5mm).
```

## Disclaimer

I don't work with PCBs so I don't know of all the nuance and conventions people
use when designing keyboards. This script is a good way to get started with some
layout data, but expect to manually tweak the results afterwards.

## Known issues

- Rotation is complicated in a number of ways
- Key sizing is not currently takend into consideration
- Switch modules are often defined in arbitrary order which means this may not
  produce a layout that you can just use with `keymap-editor` or `keymap-drawer`
- Much more, this is a very basic implementation right now.


[crides]:https://github.com/crides
[layout.py]:https://gist.github.com/crides/6d12d1033368e24873b0142941311e5d
[kicad-utils]:https://www.npmjs.com/package/kicad-utils