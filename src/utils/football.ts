import type { Match, MatchOutcome, MatchStatus, Team } from '@/types/match'
import type { PositionGroup } from '@/types/player'

/** football-data.org identifiers. */
export const MAN_UNITED_ID = 66
export const PREMIER_LEAGUE_CODE = 'PL'
/** Same CDN the API returns in `team.crest`; used before the squad request resolves. */
export const MAN_UNITED_CREST = `https://crests.football-data.org/${MAN_UNITED_ID}.png`

const LIVE_STATUSES: MatchStatus[] = ['IN_PLAY', 'PAUSED', 'EXTRA_TIME', 'PENALTY_SHOOTOUT']
const COMPLETED_STATUSES: MatchStatus[] = ['FINISHED', 'AWARDED']
const UPCOMING_STATUSES: MatchStatus[] = ['SCHEDULED', 'TIMED']

export const isLive = (match: Match) => LIVE_STATUSES.includes(match.status)

export const isCompleted = (match: Match) =>
  COMPLETED_STATUSES.includes(match.status) && match.score.home !== null && match.score.away !== null

/**
 * A match counts as upcoming only if it is still scheduled AND its kick-off is in the future.
 * A scheduled match whose kick-off has passed (status not yet updated) is not treated as upcoming.
 */
export const isUpcoming = (match: Match, now = Date.now()) =>
  UPCOMING_STATUSES.includes(match.status) && new Date(match.utcDate).getTime() > now

/** TIMED means the kick-off time is confirmed; SCHEDULED may carry a placeholder time. */
export const hasConfirmedKickoff = (match: Match) => match.status !== 'SCHEDULED'

export const isHome = (match: Match) => match.homeTeam.id === MAN_UNITED_ID

export const opponentOf = (match: Match): Team => (isHome(match) ? match.awayTeam : match.homeTeam)

export function outcomeOf(match: Match): MatchOutcome | null {
  if (!isCompleted(match) || !match.score.winner) return null
  if (match.score.winner === 'DRAW') return 'draw'
  const unitedWon = (match.score.winner === 'HOME_TEAM') === isHome(match)
  return unitedWon ? 'win' : 'loss'
}

export const outcomeLabel: Record<MatchOutcome, string> = { win: 'Win', draw: 'Draw', loss: 'Loss' }

const STATUS_LABELS: Record<MatchStatus, string> = {
  SCHEDULED: 'Scheduled',
  TIMED: 'Scheduled',
  IN_PLAY: 'Live',
  PAUSED: 'Half-time',
  EXTRA_TIME: 'Extra time',
  PENALTY_SHOOTOUT: 'Penalties',
  FINISHED: 'Full time',
  SUSPENDED: 'Suspended',
  POSTPONED: 'Postponed',
  CANCELLED: 'Cancelled',
  AWARDED: 'Awarded',
}

export const statusLabel = (status: MatchStatus) => STATUS_LABELS[status]

export function roundLabel(match: Match): string | null {
  if (match.matchday && (!match.stage || match.stage === 'REGULAR_SEASON')) return `Matchday ${match.matchday}`
  if (!match.stage) return null
  const stage = match.stage
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  return match.matchday ? `${stage} · Matchday ${match.matchday}` : stage
}

export function seasonLabel(season: { startDate: string; endDate: string } | null | undefined): string | null {
  if (!season) return null
  const start = new Date(season.startDate).getUTCFullYear()
  const end = new Date(season.endDate).getUTCFullYear()
  if (Number.isNaN(start) || Number.isNaN(end)) return null
  return start === end ? String(start) : `${start}/${String(end).slice(-2)}`
}

/** Maps any provider position label onto the four squad groups used by the UI. */
export function toPositionGroup(position: string | null | undefined): PositionGroup | null {
  if (!position) return null
  const p = position.toLowerCase()
  if (p.includes('goal')) return 'goalkeepers'
  if (p.includes('back') || p.includes('defen')) return 'defenders'
  if (p.includes('midfield')) return 'midfielders'
  if (p.includes('offen') || p.includes('forward') || p.includes('wing') || p.includes('striker') || p.includes('attack'))
    return 'forwards'
  return null
}

export const positionGroupLabel: Record<PositionGroup, string> = {
  goalkeepers: 'Goalkeepers',
  defenders: 'Defenders',
  midfielders: 'Midfielders',
  forwards: 'Forwards',
}

export function ordinalSuffix(n: number): string {
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 13) return 'th'
  return ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}
