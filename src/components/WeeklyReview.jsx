import { useEffect, useState } from 'react'
import { fmtMD } from '../lib/date'

function WeekRow({ row, onChangePlan, onChangeWeekGoal }) {
  const { rep, plan, calls, appt, goal } = row
  const [planVal, setPlanVal] = useState(plan)
  const [goalVal, setGoalVal] = useState(goal)

  useEffect(() => setPlanVal(plan), [plan])
  useEffect(() => setGoalVal(goal), [goal])

  const rate = calls > 0 ? Math.round((appt / calls) * 1000) / 10 : 0
  const goalPct = goal > 0 ? Math.min(100, (appt / goal) * 100) : 0
  const planRate = plan > 0 ? Math.round((calls / plan) * 1000) / 10 : null
  const planPct = plan > 0 ? Math.min(100, (calls / plan) * 100) : 0

  const commitPlan = () => {
    const val = Math.max(0, parseInt(planVal, 10) || 0)
    setPlanVal(val)
    if (val !== plan) onChangePlan(rep.id, val)
  }

  const commitGoal = () => {
    const val = Math.max(0, parseInt(goalVal, 10) || 0)
    setGoalVal(val)
    if (val !== goal) onChangeWeekGoal(rep.id, val)
  }

  return (
    <tr>
      <td>{rep.name}</td>
      <td className="num">
        <input
          type="number"
          className="plan-input"
          min="0"
          value={planVal}
          onChange={(e) => setPlanVal(e.target.value)}
          onBlur={commitPlan}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
        />
      </td>
      <td className="num">{calls}</td>
      <td className="num">
        {planRate === null ? (
          '—'
        ) : (
          <>
            <span className="wk-bar-track">
              <span className="wk-bar-fill" style={{ width: `${planPct}%` }} />
            </span>
            {planRate}%
          </>
        )}
      </td>
      <td className="num">{appt}</td>
      <td className="num">
        <input
          type="number"
          className="goal-input"
          min="0"
          value={goalVal}
          onChange={(e) => setGoalVal(e.target.value)}
          onBlur={commitGoal}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
        />
      </td>
      <td className="num">
        <span className="wk-bar-track">
          <span className="wk-bar-fill" style={{ width: `${goalPct}%` }} />
        </span>
        {rate}%
      </td>
    </tr>
  )
}

export default function WeeklyReview({
  chunks,
  selectedStart,
  onSelectWeek,
  rows,
  teamAppt,
  teamGoal,
  onChangePlan,
  onChangeWeekGoal,
}) {
  const teamPct = teamGoal > 0 ? Math.min(100, (teamAppt / teamGoal) * 100) : 0

  return (
    <div className="week-section">
      <div className="week-header">
        <h2>週次振り返り</h2>
      </div>
      <select
        className="week-select"
        value={selectedStart}
        onChange={(e) => onSelectWeek(e.target.value)}
      >
        {chunks.map((c) => (
          <option key={c.start} value={c.start}>
            {fmtMD(c.start)}〜{fmtMD(c.end)}週
          </option>
        ))}
      </select>
      <div className="week-team-line">
        <div className="label">チーム週間アポ獲得数(アポ獲得週目標 {teamGoal}件)</div>
        <div className="num">
          {teamAppt} / {teamGoal}
        </div>
      </div>
      <div className="week-track">
        <div className="week-fill" style={{ width: `${teamPct}%` }} />
      </div>
      <table>
        <thead>
          <tr>
            <th>担当者</th>
            <th>架電予定数</th>
            <th>架電数</th>
            <th>予定達成率</th>
            <th>アポ獲得数</th>
            <th>アポ獲得週目標</th>
            <th>アポ獲得率</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <WeekRow
              key={r.rep.id}
              row={r}
              onChangePlan={onChangePlan}
              onChangeWeekGoal={onChangeWeekGoal}
            />
          ))}
        </tbody>
      </table>
      <div className="footnote">
        架電予定数とアポ獲得週目標は表内の数字をクリックして本人が自由に編集できます(架電予定数は週ごとに個別設定、アポ獲得週目標の初期値は5件/週)。予定達成率は架電数÷架電予定数です。週は月曜〜金曜で区切っています。
      </div>
    </div>
  )
}
