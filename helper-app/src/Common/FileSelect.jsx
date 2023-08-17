import { useCallback, useState } from 'react'

export default function FileSelect ({ onChange, accept = '*' }) {
  const [importType, setImportType] = useState('file')
  const [loading, setLoading] = useState(null)

  const handleFile = useCallback(async event => {
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

  const handleText = useCallback(event => {
    onChange({ name: 'unknown', contents: event.target.value })
  }, [onChange])

  return (
    <>
      <p>
        Import from:
        <label><input checked={importType === 'file'} onChange={e => setImportType(e.target.value)} name="import-type" type="radio" value="file" /> File</label>
        <label><input checked={importType === 'text'} onChange={e => setImportType(e.target.value)} name="import-type" type="radio" value="text" /> Text</label>
      </p>
      <div>
        {importType === 'file' && (
          <input
            type="file"
            accept={accept}
            onChange={handleFile}
          />
        )}
        {importType === 'text' && (
          <textarea
            style={{ tabSize: 4, width: '100%', boxSizing: 'border-box' }}
            onChange={handleText}
            wrap="off"
            cols={80}
            rows={12}
          />
        )}
      </div>
      <div>
        {loading && <span><em>Loading...</em></span>}
      </div>
    </>
  )
}
