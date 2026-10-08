const calendar = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Tashkent', year: 'numeric', month: 'numeric', day: 'numeric',
})

/** Current month's due date; payment completion is not tracked by the schema. */
export function reminderDaysLeft(dayOfMonth: number, now = new Date()): number {
  if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31 || !Number.isFinite(now.getTime())) {
    throw new RangeError('Invalid reminder date')
  }
  const parts = calendar.formatToParts(now)
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find(p => p.type === type)?.value)
  const year = part('year')
  const month = part('month')
  const today = part('day')
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return Math.min(dayOfMonth, lastDay) - today
}
