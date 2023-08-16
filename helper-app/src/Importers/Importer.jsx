import KicadImporter from './KicadImporter.jsx'

const importers = {
  kicad: KicadImporter
}

export default function Importer ({ type, onSubmit, onCancel }) {
  const Component = importers[type]

  return (
    <Component
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  )
}
