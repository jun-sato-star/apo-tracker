import { useEffect, useState } from 'react'

export default function RepCard({ rep, rank, calls, appt, onRename, onChangeGoal }) {
  const [name, setName] = useState(rep.name)
  const [goal, setGoal] = useState(rep.month_goal)

  useEffect(() => setName(rep.name), [rep.name])
  useEffect(() => setGoal(rep.month_goal), [rep.month_goal])

  const rate = calls > 0 ? Math.round((appt / calls) * 1000) / 10 : 0
  const pct = rep.month_goal > 0 ? Math.min(100, (appt / rep.month_goal) * 100) : 0

  const commitName = () => {
    const trimmed = name.trim() || rep.name
    setName(trimmed)
    if (trimmed !== rep.name) onRename(rep.id, trimmed)
  }

  const commitGoal = () => {
    const val = Math.max(0, parseInt(goal, 10) || 0)
    setGoal(val)
    if (val !== rep.month_goal) onChangeGoal(rep.id, val)
  }

  return (
    <div className="rep-card">
      <div className="rep-top">
        <input
          className="rep-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
        />
        <span className="rank">#{rank}</span>
      </div>
      <div className="stat-row">
        <div className="stat calls">
          <div className="k">架電数</div>
          <div className="v">{calls}</div>
        </div>
        <div className="stat appt">
          <div className="k">アポ獲得数</div>
          <div className="v">{appt}</div>
        </div>
      </div>
      <div className="rate">アポ獲得率 {rate}%</div>
      <div className="goal-track">
        <div className="goal-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="goal-label">
        {appt} /{' '}
        <input
          type="number"
          className="month-goal-input"
          min="0"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onBlur={commitGoal}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
        />
        件(月目標)
      </div>
    </div>
  )
}
