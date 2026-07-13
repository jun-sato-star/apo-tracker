export default function TeamSummary({ teamAppt, teamGoal, teamCalls, teamRate }) {
  const pct = teamGoal > 0 ? Math.min(100, (teamAppt / teamGoal) * 100) : 0

  return (
    <div className="team-bar-section">
      <div className="team-bar-top">
        <div className="label">チーム合計アポ獲得数(目標 {teamGoal}件/月)</div>
        <div className="num">
          {teamAppt}
          <span> / {teamGoal}</span>
        </div>
      </div>
      <div className="team-track">
        <div className="team-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="team-sub-stats">
        架電数合計 <span className="hl">{teamCalls}</span>件 ・ アポ獲得率 {teamRate}%
      </div>
    </div>
  )
}
