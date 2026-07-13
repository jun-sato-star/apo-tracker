import RepCard from './RepCard'

export default function RepGrid({ totals, onRename, onChangeGoal }) {
  const sorted = [...totals].sort((a, b) => b.appt - a.appt)
  const rankOf = (id) => sorted.findIndex((t) => t.rep.id === id) + 1

  return (
    <div className="grid">
      {totals.map((t) => (
        <RepCard
          key={t.rep.id}
          rep={t.rep}
          rank={rankOf(t.rep.id)}
          calls={t.calls}
          appt={t.appt}
          onRename={onRename}
          onChangeGoal={onChangeGoal}
        />
      ))}
    </div>
  )
}
