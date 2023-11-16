
export default function Offset ({ value, onUpdate }) {
  const [x, y] = value || [0, 0]

  return (
    <div style={{
      margin: '15px',
      padding: '5px',
      backdropFilter: 'blur(5px)',
      background: 'rgba(var(--bg-rgb), 0.75)',
      borderRadius: '4px',
      boxShadow: '0 5px 10px 0 rgba(0, 0, 0, 0.3)',
      width: 'max-content'
    }}>
      <div><strong>Offset</strong></div>
      <label style={{ display: 'block', margin: '5px 0' }}>
        x: <Input value={x} onChange={v => onUpdate([v, y])} />
      </label>
      <label style={{ display: 'block', margin: '5px 0' }}>
        y: <Input value={y} onChange={v => onUpdate([x, v])} />
      </label>
    </div>
  )
}

function Input ({ value, onChange }) {
  const formatted = value.toFixed(2)

  return (
    <input
      value={formatted}
      onChange={e => {
        const v = Number(e.target.value)
        onChange(Number.isNaN(v) ? value : v)
      }}
      style={{
        width: '50px',
        textAlign: 'right'
      }}
    />
  )
}
