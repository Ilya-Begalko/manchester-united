import type { ProxyResult } from './cache.js'
import { handleFootballRequest } from './football.js'

const TEAM_ID = 66
/** TheSportsDB team id for Manchester United. */
const SPORTSDB_TEAM_ID = 133612
/** Public free test key published in the TheSportsDB documentation. */
const SPORTSDB_BASE = 'https://www.thesportsdb.com/api/v1/json/123'
const TTL = 24 * 60 * 60
const PENDING_TTL = 30
/** The documented limit is 30 req/min, but Cloudflare starts returning 429 earlier; keep well below it. */
const SEARCH_GAP_MS = 3_000
/** Leaves headroom under the serverless function's 60 s limit. */
const TIME_BUDGET_MS = 40_000

export interface PlayerPhotoDto {
  url: string
  smallUrl: string
  /** Transparent PNG cut-out (true) or a regular photo (false). */
  cutout: boolean
  sourceUrl: string
}

interface SquadMember {
  id: number
  name: string
  dateOfBirth: string | null
}

interface SportsDbPlayer {
  idPlayer: string
  strPlayer: string
  strSport?: string | null
  dateBorn?: string | null
  strCutout?: string | null
  strThumb?: string | null
}

const SPECIAL_LETTERS: Record<string, string> = { ı: 'i', ø: 'o', ł: 'l', đ: 'd', ß: 'ss', æ: 'ae', œ: 'oe' }

function asciiName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[ıøłđßæœ]/g, (ch) => SPECIAL_LETTERS[ch])
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z]+/g, ' ')
    .trim()
}

const nameTokens = (name: string) => new Set(asciiName(name).split(' ').filter((t) => t.length >= 3))

/**
 * A photo is accepted only when the birth date matches exactly AND the names share
 * at least one meaningful token. Anything less certain keeps the placeholder.
 */
function isSamePlayer(member: SquadMember, candidate: SportsDbPlayer): boolean {
  if (candidate.strSport && candidate.strSport !== 'Soccer') return false
  if (!member.dateOfBirth || !candidate.dateBorn || member.dateOfBirth.slice(0, 10) !== candidate.dateBorn.slice(0, 10))
    return false
  const own = nameTokens(member.name)
  for (const token of nameTokens(candidate.strPlayer)) if (own.has(token)) return true
  return false
}

function toPhoto(player: SportsDbPlayer): PlayerPhotoDto | null {
  const base = player.strCutout || player.strThumb
  if (!base) return null
  return {
    url: `${base}/medium`,
    smallUrl: `${base}/small`,
    cutout: Boolean(player.strCutout),
    sourceUrl: `https://www.thesportsdb.com/player/${player.idPlayer}`,
  }
}

async function sportsDbGet(path: string): Promise<SportsDbPlayer[]> {
  const response = await fetch(`${SPORTSDB_BASE}/${path}`, { signal: AbortSignal.timeout(10_000) })
  if (!response.ok) throw new Error(`TheSportsDB responded with ${response.status}`)
  const json = (await response.json()) as { player?: SportsDbPlayer[] | null }
  return json.player ?? []
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Progress survives between requests on a warm server, so a squad larger than one
 * request's time budget is completed over several calls instead of hammering the API.
 */
interface Progress {
  photos: Record<number, PlayerPhotoDto>
  checked: Set<number>
  bulkDone: boolean
  startedAt: number
}

let progress: Progress | null = null
let running: Promise<ProxyResult> | null = null
let blockedUntil = 0

function respond(state: Progress, squad: SquadMember[]): ProxyResult {
  const pending = squad.some((p) => !state.checked.has(p.id))
  return {
    status: 200,
    body: { source: { name: 'TheSportsDB', url: 'https://www.thesportsdb.com/' }, photos: state.photos, pending },
    ttl: pending ? PENDING_TTL : TTL,
  }
}

async function run(apiKey: string | undefined): Promise<ProxyResult> {
  const team = await handleFootballRequest(`teams/${TEAM_ID}`, {}, apiKey)
  if (team.status !== 200) return { ...team, ttl: 0 }
  const squad = ((team.body as { squad?: SquadMember[] }).squad ?? []).filter((p) => p.dateOfBirth)

  if (!progress || Date.now() - progress.startedAt > TTL * 1000) {
    progress = { photos: {}, checked: new Set(), bulkDone: false, startedAt: Date.now() }
  }
  const state = progress

  const assign = (candidates: SportsDbPlayer[]) => {
    for (const member of squad) {
      if (state.photos[member.id]) continue
      const found = candidates.filter((c) => isSamePlayer(member, c))
      const photo = found.length === 1 ? toPhoto(found[0]) : null
      if (photo) {
        state.photos[member.id] = photo
        state.checked.add(member.id)
      }
    }
  }

  if (Date.now() < blockedUntil) return respond(state, squad)

  const deadline = Date.now() + TIME_BUDGET_MS
  try {
    // One bulk call first (the free key returns only part of the squad), then individual searches for the rest.
    if (!state.bulkDone) {
      assign(await sportsDbGet(`lookup_all_players.php?id=${SPORTSDB_TEAM_ID}`))
      state.bulkDone = true
    }
    for (const member of squad) {
      if (state.checked.has(member.id)) continue
      if (Date.now() + SEARCH_GAP_MS > deadline) break
      await wait(SEARCH_GAP_MS)
      assign(await sportsDbGet(`searchplayers.php?p=${encodeURIComponent(asciiName(member.name).replace(/ /g, '_'))}`))
      state.checked.add(member.id)
    }
  } catch {
    // Rate limited or unreachable: keep what we have and let the limit window reset.
    blockedUntil = Date.now() + 60_000
  }

  return respond(state, squad)
}

export function handlePhotosRequest(apiKey: string | undefined): Promise<ProxyResult> {
  running ??= run(apiKey).finally(() => (running = null))
  return running
}
