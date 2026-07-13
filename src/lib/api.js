import { supabase } from './supabaseClient'

export async function fetchReps() {
  const { data, error } = await supabase
    .from('reps')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function addRep(name) {
  const { data, error } = await supabase
    .from('reps')
    .insert({ name })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateRepName(id, name) {
  const { error } = await supabase.from('reps').update({ name }).eq('id', id)
  if (error) throw error
}

export async function updateRepMonthGoal(id, monthGoal) {
  const { error } = await supabase
    .from('reps')
    .update({ month_goal: monthGoal })
    .eq('id', id)
  if (error) throw error
}

export async function updateRepWeekGoal(id, weekGoal) {
  const { error } = await supabase
    .from('reps')
    .update({ week_goal: weekGoal })
    .eq('id', id)
  if (error) throw error
}

export async function fetchDailyLogs() {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

export async function addDailyLog({ repId, date, calls, appointments }) {
  const { data, error } = await supabase
    .from('daily_logs')
    .insert({ rep_id: repId, date, calls, appointments })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteDailyLog(id) {
  const { error } = await supabase.from('daily_logs').delete().eq('id', id)
  if (error) throw error
}

export async function fetchCallPlans() {
  const { data, error } = await supabase.from('call_plans').select('*')
  if (error) throw error
  return data
}

export async function upsertCallPlan({ repId, weekStart, plannedCalls }) {
  const { error } = await supabase
    .from('call_plans')
    .upsert(
      { rep_id: repId, week_start: weekStart, planned_calls: plannedCalls },
      { onConflict: 'rep_id,week_start' }
    )
  if (error) throw error
}
