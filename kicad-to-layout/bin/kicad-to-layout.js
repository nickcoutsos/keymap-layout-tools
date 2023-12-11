#!/usr/bin/env node
import fs from 'node:fs/promises'
import process from 'node:process'

import yargs from 'yargs/yargs'
import { formatMetadata } from 'keymap-layout-tools/lib/metadata.js'

import * as kicad from '../lib/kicad.js'
import * as preview from '../lib/preview.js'

const argumentParser = yargs()
  .positional('path', {
    describe: 'Path to kicad_pcb file'
  })
  .option('invert-x', {
    describe: 'Flip layout data along X axis',
    default: false,
    type: 'boolean'
  })
  .option('mirror-x', {
    describe: 'Mirror layout along X axis (to produce a full keyboard from a single PCB of a symmetric split).',
    default: false,
    type: 'boolean'
  })
  .option('mirror-gap', {
    describe: 'Width of blank space (in key units) to leave between keyboard halves',
    default: 1,
    type: 'integer'
  })
  .option('preview', {
    describe: 'Render the generated layout in terminal using Unicode braille dots.',
    default: false,
    type: 'boolean'
  })
  .option('choc', {
    describe: 'Interpret switch positioning based on kailh choc key spacing (18.5mm x 17.5mm).',
    default: false,
    type: 'boolean'
  })
  .option('infer-key-size', {
    describe: 'Attempt to parse keycap dimensions from switch descriptions',
    default: false,
    type: 'boolean'
  })
  .option('module-pattern', {
    describe: 'PRCE regex pattern to apply to module/footprints being considered for key switches. This can be used to be more specific where power/reset switches otherwise follow the same naming pattern as keys.',
    default: '.*',
    coerce: val => new RegExp(val)
  })
  .version(false)
  .help()

async function main (args) {
  const parsed = argumentParser.parse(args)
  const [pcbFilename] = parsed._
  const options = {
    invert: parsed.invertX,
    mirror: parsed.mirrorX,
    mirrorGap: parsed.mirrorGap,
    modulePattern: parsed.modulePattern,
    inferKeySize: parsed.inferKeySize,
    spacing: (
      parsed.choc
        ? { x: 18.5, y: 17.5 }
        : { x: 19, y: 19 }
    )
  }

  if (!pcbFilename) {
    argumentParser.showHelp()
    process.exit(1)
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

  console.log(
    parsed.preview
      ? preview.render(layout)
      : formatMetadata(layout)
  )
}

main(process.argv.slice(2))
