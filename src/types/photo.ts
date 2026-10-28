export interface PlayerPhoto {
  url: string
  smallUrl: string
  /** Transparent PNG cut-out (true) or a regular photo (false). */
  cutout: boolean
  /** Player page on TheSportsDB. */
  sourceUrl: string
}

export interface PlayerPhotos {
  source: { name: string; url: string }
  /** Keyed by football-data.org player id (shared by squad and scorers). */
  photos: Record<number, PlayerPhoto>
  /** True while the server is still looking up the rest of the squad. */
  pending: boolean
}
