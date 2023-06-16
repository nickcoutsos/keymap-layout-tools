#!/usr/bin/env node
import fs from 'node:fs/promises'
import process from 'node:process'

import { formatMetadata } from 'keymap-layout-tools/lib/metadata.js'
import * as kicad from '../lib/kicad.js'

async function main (args) {
  const flags = args.filter(arg => arg.startsWith('--'))
  const positional = args.filter(arg => !arg.startsWith('--'))
  const invertX = flags.includes('--invert-x')
  const splitMirror = flags.includes('--split-mirror')
  const pcbFilename = positional[0]

  const contents = await fs.readFile(pcbFilename, 'utf-8')
  const switches = kicad.getSwitches(contents)
  let layout = kicad.generateLayout(switches)

  if (invertX) {
    layout = kicad.flip(layout)
  }
  if (splitMirror) {
    layout = mirror(layout)
  }

  console.log(formatMetadata(layout))
}

main(process.argv.slice(2))
