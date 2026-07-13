export function fmtDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayStr() {
  return fmtDate(new Date())
}

export function fmtMD(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// 指定した年月を「月をまたがない月〜金」の週チャンクに分割する。
// 例: 月末が水曜なら、最後の週は月〜水の3日間だけになる。
export function monthWeekChunks(year, month) {
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 0)
  const chunks = []
  let cur = new Date(monthStart)
  while (cur <= monthEnd) {
    const dow = cur.getDay()
    if (dow === 0) {
      cur.setDate(cur.getDate() + 1)
      continue
    }
    if (dow === 6) {
      cur.setDate(cur.getDate() + 2)
      continue
    }
    const daysToFriday = 5 - dow
    let end = new Date(cur)
    end.setDate(end.getDate() + daysToFriday)
    if (end > monthEnd) end = new Date(monthEnd)
    chunks.push({ start: fmtDate(cur), end: fmtDate(end) })
    const next = new Date(cur)
    next.setDate(next.getDate() + daysToFriday + 3)
    cur = next
  }
  return chunks
}
