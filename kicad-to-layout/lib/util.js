export const and = (...predicates) => (
  value => predicates.every(predicate => predicate(value))
)

export const or = (...predicates) => (
  value => predicates.some(predicate => predicate(value))
)

export const nameIs = name => (
  value => Array.isArray(value) && value[0] === name
)