import { useEffect, useState } from 'react'

export default function Toast({ toast }) {
  const [visible, setVisible] = useState(false)
  const [text, setText] = useState('')

  useEffect(() => {
    if (!toast) return undefined
    setText(toast.text)
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  return <div className={`toast${visible ? ' show' : ''}`}>{text}</div>
}
