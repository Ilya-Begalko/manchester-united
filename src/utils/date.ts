/** Matches the English UI copy; times are still shown in the visitor's own time zone. */
const locale = 'en-GB'

const dateFormatter = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' })
const shortDateFormatter = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' })
const weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'long' })
const longDateFormatter = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
const timeFormatter = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' })
const relativeFormatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

export const formatDate = (iso: string) => dateFormatter.format(new Date(iso))
export const formatShortDate = (iso: string) => shortDateFormatter.format(new Date(iso))
export const formatWeekday = (iso: string) => weekdayFormatter.format(new Date(iso))
export const formatLongDate = (iso: string) => longDateFormatter.format(new Date(iso))
export const formatTime = (iso: string) => timeFormatter.format(new Date(iso))

export function timeZoneName(): string {
  const part = new Intl.DateTimeFormat(locale, { timeZoneName: 'short' })
    .formatToParts(new Date())
    .find((p) => p.type === 'timeZoneName')
  return part?.value ?? ''
}

export function formatRelative(iso: string, now = Date.now()): string {
  const diffMinutes = Math.round((new Date(iso).getTime() - now) / 60_000)
  const abs = Math.abs(diffMinutes)
  if (abs < 60) return relativeFormatter.format(diffMinutes, 'minute')
  if (abs < 60 * 24) return relativeFormatter.format(Math.round(diffMinutes / 60), 'hour')
  return relativeFormatter.format(Math.round(diffMinutes / (60 * 24)), 'day')
}

export interface Countdown {
  days: number
  hours: number
  minutes: number
}

export function countdownTo(iso: string, now = Date.now()): Countdown | null {
  const diff = new Date(iso).getTime() - now
  if (diff <= 0) return null
  const totalMinutes = Math.floor(diff / 60_000)
  return {
    days: Math.floor(totalMinutes / (60 * 24)),
    hours: Math.floor((totalMinutes % (60 * 24)) / 60),
    minutes: totalMinutes % 60,
  }
}
