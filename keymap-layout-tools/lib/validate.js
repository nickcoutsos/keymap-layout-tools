const isNumber = require('lodash/isNumber')

class InfoValidationError extends Error {
  constructor (errors) {
    super()
    this.name = 'InfoValidationError'
    this.errors = errors
  }
}

function validateInfoJson (info) {
  const errors = []

  if (typeof info !== 'object' || info === null) {
    errors.push('info.json root must be an object')
  } else if (!info.layouts) {
    errors.push('info must define "layouts"')
  } else if (typeof info.layouts !== 'object' || info.layouts === null) {
    errors.push('layouts must be an object')
  } else if (Object.values(info.layouts).length === 0) {
    errors.push('layouts must define at least one layout')
  } else {
    for (const name in info.layouts) {
      const layout = info.layouts[name]
      if (typeof layout !== 'object' || layout === null) {
        errors.push(`layout ${name} must be an object`)
      } else if (!Array.isArray(layout.layout)) {
        errors.push(`layout ${name} must define "layout" array`)
      } else {
        const anyKeyHasPosition = layout.layout.some(key => (
          key?.row !== undefined ||
          key?.col !== undefined
        ))

        for (const i in layout.layout) {
          const key = layout.layout[i]
          const keyPath = `layouts[${name}].layout[${i}]`

          if (typeof key !== 'object' || key === null) {
            errors.push(`Key definition at ${keyPath} must be an object`)
          } else {
            const optionalNumberProps = ['u', 'h', 'r', 'rx', 'ry']
            if (!isNumber(key.x)) {
              errors.push(`Key definition at ${keyPath} must include "x" position`)
            }
            if (!isNumber(key.y)) {
              errors.push(`Key definition at ${keyPath} must include "y" position`)
            }
            for (const prop of optionalNumberProps) {
              if (prop in key && !isNumber(key[prop])) {
                errors.push(`Key definition at ${keyPath} optional "${prop}" must be number`)
              }
            }
            for (const prop of ['row', 'col']) {
              if (anyKeyHasPosition && !(prop in key)) {
                errors.push(`Key definition at ${keyPath} is missing "${prop}"`)
              } else if (prop in key && (!Number.isInteger(key[prop]) || key[prop] < 0)) {
                errors.push(`Key definition at ${keyPath} "${prop}" must be a non-negative integer`)
              }
            }
          }
        }
      }
    }
  }

  if (errors.length) {
    throw new InfoValidationError(errors)
  }
}

module.exports = {
  InfoValidationError,
  validateInfoJson
}
