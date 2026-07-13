import { useState } from 'react'

export default function AddRepRow({ onAdd }) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    const trimmed = name.trim()
    if (!trimmed || submitting) return
    setSubmitting(true)
    try {
      await onAdd(trimmed)
      setName('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="add-rep-row">
      <input
        type="text"
        placeholder="新しいメンバー名"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <button className="add-rep-btn" onClick={submit} disabled={submitting}>
        メンバー追加
      </button>
    </div>
  )
}
