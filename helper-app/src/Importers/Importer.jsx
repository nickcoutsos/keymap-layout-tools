import ZmkDtsImporter from './ZmkDevicetree/DtsImporter.jsx'
import KicadImporter from './Kicad/KicadImporter.jsx'

const importers = {
  dts: ZmkDtsImporter,
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
