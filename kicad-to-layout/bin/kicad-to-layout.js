#!/usr/bin/env node
import fs from 'node:fs/promises'
import process from 'node:process'

import Canvas from 'drawille-canvas'
import { formatMetadata } from 'keymap-layout-tools/lib/metadata.js'
import * as kicad from '../lib/kicad.js'

async function main (args) {
  const pcbFilename = args.find(arg => !arg.startsWith('--'))

  if (!pcbFilename) {
    console.log(`Usage:
      node kicad-to-layout.js [options] <path>

      Options:
        --invert-x    Flip layout data along X axis

        --mirror-x    Mirror layout along X axis (to produce a full keyboard
                      from a single PCB of a symmetric split).

        --preview     Render the generated layout in terminal using Unicode
                      braille dots.

        --choc        Interpret switch positioning based on kailh choc key
                      spacing (18.5mm x 17.5mm).
    `)

    process.exit(1)
  }

  const options = {
    invert: args.includes('--invert-x'),
    mirror: args.includes('--mirror-x'),
    preview: args.includes('--preview'),
    spacing: (
      args.includes('--choc')
        ? { x: 18.5, y: 17.5 }
        : { x: 19, y: 19 }
    )
  }

  const contents = await fs.readFile(pcbFilename, 'utf-8')
  const layout = kicad.parseKicadLayout(contents, options)

  for (const layoutKey of layout) {
    for (const prop in layoutKey) {
      const value = layoutKey[prop]
      if (typeof value === 'number' && Math.round(value) !== value) {
        layoutKey[prop] = Number(value.toFixed(2))
      }
    }
  }

  if (options.preview) {
    preview(layout)
  } else {
    console.log(formatMetadata(layout))
  }
}

function preview (layout) {
  const canvas = new Canvas()
  const c = canvas.getContext('2d')

  const SIZE = 12
  const SPACING = 3
  for (const layoutKey of layout) {
    const params = {
      x: layoutKey.x * (SIZE - 0),
      y: layoutKey.y * (SIZE - 0),
      u: (layoutKey.w || 1) * SIZE,
      h: (layoutKey.h || 1) * SIZE,
      rx: (layoutKey.x - (layoutKey.rx ?? layoutKey.x)) * -SIZE,
      ry: (layoutKey.y - (layoutKey.ry ?? layoutKey.y)) * -SIZE,
      r: layoutKey.r || 0
    }

    c.save()
    c.translate(params.rx + params.x, params.ry + params.y)
    c.rotate(params.r)
    c.translate(-(params.rx + params.x), -(params.ry + params.y))
    c.translate(params.x, params.y)
    c.fillRect(SPACING/2, SPACING/2, params.u - SPACING, params.h - SPACING)
    c.restore()
  }

  console.log(
    c.toString()
      .split('\n')
      .map(line => line.trimEnd())
      .filter(line => line.length > 0)
      .join('\r\n')
      .replace(/ /g, '⠀')
  )
}

main(process.argv.slice(2))
