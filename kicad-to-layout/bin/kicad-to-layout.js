#!/usr/bin/env node
import fs from 'node:fs/promises'
import process from 'node:process'

import Canvas from 'drawille-canvas'
import { formatMetadata } from 'keymap-layout-tools/lib/metadata.js'
import * as kicad from '../lib/kicad.js'

async function main (args) {
  const flags = args.filter(arg => arg.startsWith('--'))
  const positional = args.filter(arg => !arg.startsWith('--'))
  const invertX = flags.includes('--invert-x')
  const splitMirror = flags.includes('--split-mirror')
  const renderPreview = flags.includes('--preview')
  const pcbFilename = positional[0]

  const contents = await fs.readFile(pcbFilename, 'utf-8')
  const switches = kicad.getSwitches(contents)
  let layout = kicad.generateLayout(switches)

  if (invertX) {
    layout = kicad.flip(layout)
  }
  if (splitMirror) {
    layout = kicad.mirror(layout)
  }

  console.log(formatMetadata(layout))

  if (renderPreview) {
    preview(layout)
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
    c.fillRect(SPACING, SPACING, params.u - SPACING, params.h - SPACING)
    c.restore()
  }

  console.log(c.toString().trimEnd())
}

main(process.argv.slice(2))
