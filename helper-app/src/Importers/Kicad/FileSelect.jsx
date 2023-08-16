import { useCallback, useState } from 'react'

export default function FileSelect ({ onChange }) {
  const [loading, setLoading] = useState(null)

  const handleChange = useCallback(async event => {
    const [file] = event.target.files
    setLoading(true)
    try {
      const contents = await file.text()
      onChange({ name: file.name, contents })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [onChange, setLoading])

  return (
    <>
      <input
        type="file"
        accept="*.kicad_pcb"
        onChange={handleChange}
      />
      {loading && <span><em>Loading...</em></span>}
    </>
  )
}
