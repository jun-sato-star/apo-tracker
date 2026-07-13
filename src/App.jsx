import { useCallback, useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import TeamSummary from './components/TeamSummary'
import RepGrid from './components/RepGrid'
import AddRepRow from './components/AddRepRow'
import WeeklyReview from './components/WeeklyReview'
import LogSection from './components/LogSection'
import Toast from './components/Toast'
import { supabase } from './lib/supabaseClient'
import * as api from './lib/api'
import { monthWeekChunks, todayStr } from './lib/date'
import './App.css'

function App() {
  const [reps, setReps] = useState([])
  const [logs, setLogs] = useState([])
  const [callPlans, setCallPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [toast, setToast] = useState(null)

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1)
  const [selectedWeekStart, setSelectedWeekStart] = useState('')

  const notify = useCallback((text) => {
    setToast({ text, id: Date.now() })
  }, [])

  const loadAll = useCallback(async () => {
    try {
      const [repsData, logsData, plansData] = await Promise.all([
        api.fetchReps(),
        api.fetchDailyLogs(),
        api.fetchCallPlans(),
      ])
      setReps(repsData)
      setLogs(logsData)
      setCallPlans(plansData)
      setLoadError(null)
    } catch (e) {
      console.error(e)
      setLoadError(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // 他のメンバーが更新した内容をリアルタイムで反映する
  useEffect(() => {
    const channel = supabase
      .channel('apo-tracker-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reps' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_logs' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'call_plans' }, loadAll)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadAll])

  const chunks = useMemo(() => monthWeekChunks(viewYear, viewMonth), [viewYear, viewMonth])

  useEffect(() => {
    const starts = chunks.map((c) => c.start)
    if (starts.includes(selectedWeekStart)) return
    const today = todayStr()
    const todayChunk = chunks.find((c) => today >= c.start && today <= c.end)
    setSelectedWeekStart(todayChunk ? todayChunk.start : (chunks[0]?.start ?? ''))
  }, [chunks, selectedWeekStart])

  const monthKey = `${viewYear}-${String(viewMonth).padStart(2, '0')}`
  const monthTotals = useMemo(() => {
    return reps.map((rep) => {
      let calls = 0
      let appt = 0
      logs.forEach((l) => {
        if (l.rep_id === rep.id && l.date.slice(0, 7) === monthKey) {
          calls += l.calls
          appt += l.appointments
        }
      })
      return { rep, calls, appt }
    })
  }, [reps, logs, monthKey])

  const teamAppt = monthTotals.reduce((s, t) => s + t.appt, 0)
  const teamGoal = reps.reduce((s, r) => s + r.month_goal, 0)
  const teamCalls = monthTotals.reduce((s, t) => s + t.calls, 0)
  const teamRate = teamCalls > 0 ? Math.round((teamAppt / teamCalls) * 1000) / 10 : 0

  const weekRows = useMemo(() => {
    const chosen = chunks.find((c) => c.start === selectedWeekStart)
    if (!chosen) return []
    return reps.map((rep) => {
      let calls = 0
      let appt = 0
      logs.forEach((l) => {
        if (l.rep_id === rep.id && l.date >= chosen.start && l.date <= chosen.end) {
          calls += l.calls
          appt += l.appointments
        }
      })
      const planEntry = callPlans.find((p) => p.rep_id === rep.id && p.week_start === chosen.start)
      return { rep, calls, appt, plan: planEntry?.planned_calls ?? 0, goal: rep.week_goal }
    })
  }, [reps, logs, callPlans, chunks, selectedWeekStart])

  const weekTeamAppt = weekRows.reduce((s, r) => s + r.appt, 0)
  const weekTeamGoal = weekRows.reduce((s, r) => s + r.goal, 0)

  const recentLogs = useMemo(() => {
    const repById = new Map(reps.map((r) => [r.id, r.name]))
    return [...logs]
      .sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at))
      .slice(0, 50)
      .map((l) => ({ ...l, repName: repById.get(l.rep_id) ?? '(不明)' }))
  }, [logs, reps])

  const handlePrevMonth = () => {
    setViewMonth((m) => {
      if (m === 1) {
        setViewYear((y) => y - 1)
        return 12
      }
      return m - 1
    })
    setSelectedWeekStart('')
  }

  const handleNextMonth = () => {
    setViewMonth((m) => {
      if (m === 12) {
        setViewYear((y) => y + 1)
        return 1
      }
      return m + 1
    })
    setSelectedWeekStart('')
  }

  const handleAddRep = async (name) => {
    try {
      const newRep = await api.addRep(name)
      setReps((prev) => [...prev, newRep])
    } catch (e) {
      console.error(e)
      notify(e.code === '23505' ? '同じ名前のメンバーが既に存在します' : 'メンバーの追加に失敗しました')
    }
  }

  const handleRenameRep = async (id, name) => {
    const prevReps = reps
    setReps((prev) => prev.map((r) => (r.id === id ? { ...r, name } : r)))
    try {
      await api.updateRepName(id, name)
    } catch (e) {
      console.error(e)
      notify(e.code === '23505' ? '同じ名前のメンバーが既に存在します' : '名前の変更に失敗しました')
      setReps(prevReps)
    }
  }

  const handleChangeMonthGoal = async (id, value) => {
    const prevReps = reps
    setReps((prev) => prev.map((r) => (r.id === id ? { ...r, month_goal: value } : r)))
    try {
      await api.updateRepMonthGoal(id, value)
    } catch (e) {
      console.error(e)
      notify('月目標の更新に失敗しました')
      setReps(prevReps)
    }
  }

  const handleChangeWeekGoal = async (id, value) => {
    const prevReps = reps
    setReps((prev) => prev.map((r) => (r.id === id ? { ...r, week_goal: value } : r)))
    try {
      await api.updateRepWeekGoal(id, value)
    } catch (e) {
      console.error(e)
      notify('週目標の更新に失敗しました')
      setReps(prevReps)
    }
  }

  const handleChangePlan = async (repId, value) => {
    if (!selectedWeekStart) return
    const prevPlans = callPlans
    setCallPlans((prev) => {
      const idx = prev.findIndex((p) => p.rep_id === repId && p.week_start === selectedWeekStart)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], planned_calls: value }
        return next
      }
      return [...prev, { rep_id: repId, week_start: selectedWeekStart, planned_calls: value }]
    })
    try {
      await api.upsertCallPlan({ repId, weekStart: selectedWeekStart, plannedCalls: value })
    } catch (e) {
      console.error(e)
      notify('架電予定数の更新に失敗しました')
      setCallPlans(prevPlans)
    }
  }

  const handleAddLog = async ({ repId, date, calls, appointments }) => {
    const newLog = await api.addDailyLog({ repId, date, calls, appointments })
    setLogs((prev) => [newLog, ...prev])
  }

  const handleDeleteLog = async (id) => {
    const prevLogs = logs
    setLogs((prev) => prev.filter((l) => l.id !== id))
    try {
      await api.deleteDailyLog(id)
    } catch (e) {
      console.error(e)
      notify('削除に失敗しました')
      setLogs(prevLogs)
    }
  }

  if (loading) {
    return <div className="loading-screen">読み込み中...</div>
  }

  if (loadError) {
    return (
      <div className="loading-screen">
        データの読み込みに失敗しました。Supabaseの接続設定(.env)を確認してください。
      </div>
    )
  }

  return (
    <div className="app">
      <Toast toast={toast} />
      <Header
        viewYear={viewYear}
        viewMonth={viewMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
      <TeamSummary teamAppt={teamAppt} teamGoal={teamGoal} teamCalls={teamCalls} teamRate={teamRate} />
      <RepGrid totals={monthTotals} onRename={handleRenameRep} onChangeGoal={handleChangeMonthGoal} />
      <AddRepRow onAdd={handleAddRep} />
      <WeeklyReview
        chunks={chunks}
        selectedStart={selectedWeekStart}
        onSelectWeek={setSelectedWeekStart}
        rows={weekRows}
        teamAppt={weekTeamAppt}
        teamGoal={weekTeamGoal}
        onChangePlan={handleChangePlan}
        onChangeWeekGoal={handleChangeWeekGoal}
      />
      <LogSection reps={reps} logs={recentLogs} onAddLog={handleAddLog} onDeleteLog={handleDeleteLog} />
    </div>
  )
}

export default App
