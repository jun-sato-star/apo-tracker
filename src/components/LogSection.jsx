import { useEffect, useState } from 'react'
import { todayStr } from '../lib/date'

export default function LogSection({ reps, logs, onAddLog, onDeleteLog }) {
  const [repId, setRepId] = useState(reps[0]?.id ?? '')
  const [date, setDate] = useState(todayStr())
  const [calls, setCalls] = useState(0)
  const [appointments, setAppointments] = useState(0)
  const [status, setStatus] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!repId && reps[0]) setRepId(reps[0].id)
  }, [reps, repId])

  const submit = async () => {
    if (!repId) return
    const c = parseInt(calls, 10) || 0
    const a = parseInt(appointments, 10) || 0
    if (c === 0 && a === 0) {
      setStatus({ text: '架電数かアポ獲得数を入力してください', error: true })
      return
    }
    setSubmitting(true)
    try {
      await onAddLog({ repId, date: date || todayStr(), calls: c, appointments: a })
      setCalls(0)
      setAppointments(0)
      setStatus({ text: '記録しました', error: false })
      setTimeout(() => setStatus(null), 2000)
    } catch (e) {
      console.error(e)
      setStatus({ text: '保存に失敗しました。もう一度お試しください', error: true })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="log-section">
      <h2>今日の実績を記録</h2>
      <div className="log-form">
        <div className="field">
          <label htmlFor="in-rep">担当者</label>
          <select id="in-rep" value={repId} onChange={(e) => setRepId(e.target.value)}>
            {reps.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="in-date">日付</label>
          <input id="in-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="in-calls">架電数</label>
          <input
            id="in-calls"
            type="number"
            min="0"
            value={calls}
            onChange={(e) => setCalls(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="in-appt">アポ獲得数</label>
          <input
            id="in-appt"
            type="number"
            min="0"
            value={appointments}
            onChange={(e) => setAppointments(e.target.value)}
          />
        </div>
        <button className="add-btn" onClick={submit} disabled={submitting}>
          記録する
        </button>
      </div>
      <div className={`status-msg${status?.error ? ' error' : ''}`}>{status?.text ?? ''}</div>

      <table>
        <thead>
          <tr>
            <th>日付</th>
            <th>担当者</th>
            <th>架電数</th>
            <th>アポ獲得数</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id}>
              <td className="num">{l.date}</td>
              <td>{l.repName}</td>
              <td className="num">{l.calls}</td>
              <td className="num">{l.appointments}</td>
              <td>
                <button className="del" onClick={() => onDeleteLog(l.id)}>
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {logs.length === 0 && <div className="empty">まだ記録がありません</div>}
      <div className="footnote">このボードのデータはチーム全員で共有されます。担当者名はクリックして編集できます。</div>
    </div>
  )
}
