import ZmkDtsImporter from './ZmkDevicetree/DtsImporter.jsx'
import KicadImporter from './Kicad/KicadImporter.jsx'
import KleImporter from './KeyboardLayoutEditor/KleImporter.jsx'

const importers = {
  dts: ZmkDtsImporter,
  kicad: KicadImporter,
  kle: KleImporter
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
