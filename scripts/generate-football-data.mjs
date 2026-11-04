/**
 * Generates src/constants/leagues.ts and src/constants/clubs.ts
 * using TheSportsDB free v1 API (key 123, 30 req/min).
 *
 * Run: node scripts/generate-football-data.mjs
 */

import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const BASE = 'https://www.thesportsdb.com/api/v1/json/123'

// Country name (TheSportsDB) -> ISO code
const COUNTRIES = [
  ['England', 'GB-ENG'],
  ['Scotland', 'GB-SCT'],
  ['Wales', 'GB-WLS'],
  ['Northern Ireland', 'GB'],
  ['Spain', 'ES'],
  ['Germany', 'DE'],
  ['Italy', 'IT'],
  ['France', 'FR'],
  ['Portugal', 'PT'],
  ['Netherlands', 'NL'],
  ['Belgium', 'BE'],
  ['Turkey', 'TR'],
  ['Russia', 'RU'],
  ['Brazil', 'BR'],
  ['Argentina', 'AR'],
  ['Mexico', 'MX'],
  ['Colombia', 'CO'],
  ['Chile', 'CL'],
  ['Uruguay', 'UY'],
  ['Peru', 'PE'],
  ['Ecuador', 'EC'],
  ['Paraguay', 'PY'],
  ['Bolivia', 'BO'],
  ['Venezuela', 'VE'],
  ['United States', 'US'],
  ['Canada', 'CA'],
  ['Japan', 'JP'],
  ['South Korea', 'KR'],
  ['China', 'CN'],
  ['Australia', 'AU'],
  ['Saudi Arabia', 'SA'],
  ['United Arab Emirates', 'AE'],
  ['Qatar', 'QA'],
  ['Morocco', 'MA'],
  ['Egypt', 'EG'],
  ['South Africa', 'ZA'],
  ['Nigeria', 'NG'],
  ['Ivory Coast', 'CI'],
  ['Ghana', 'GH'],
  ['Senegal', 'SN'],
  ['Cameroon', 'CM'],
  ['Austria', 'AT'],
  ['Switzerland', 'CH'],
  ['Sweden', 'SE'],
  ['Norway', 'NO'],
  ['Denmark', 'DK'],
  ['Greece', 'GR'],
  ['Croatia', 'HR'],
  ['Serbia', 'RS'],
  ['Czech Republic', 'CZ'],
  ['Poland', 'PL'],
  ['Ukraine', 'UA'],
  ['Romania', 'RO'],
  ['Hungary', 'HU'],
  ['Slovakia', 'SK'],
  ['Israel', 'IL'],
  ['Ireland', 'IE'],
  ['Cyprus', 'CY'],
  ['Iceland', 'IS'],
  ['Albania', 'AL'],
  ['Bosnia and Herzegovina', 'BA'],
  ['Montenegro', 'ME'],
  ['North Macedonia', 'MK'],
  ['India', 'IN'],
  ['Indonesia', 'ID'],
  ['Thailand', 'TH'],
  ['Malaysia', 'MY'],
  ['Costa Rica', 'CR'],
  ['Honduras', 'HN'],
  ['Guatemala', 'GT'],
  ['Panama', 'PA'],
  ['Jamaica', 'JM'],
  ['Algeria', 'DZ'],
  ['Tunisia', 'TN'],
  ['Kenya', 'KE'],
  ['Tanzania', 'TZ'],
  ['Angola', 'AO'],
  ['Zimbabwe', 'ZW'],
  ['Iran', 'IR'],
  ['Iraq', 'IQ'],
  ['Jordan', 'JO'],
  ['Kuwait', 'KW'],
  ['Kazakhstan', 'KZ'],
  ['Azerbaijan', 'AZ'],
  ['Georgia', 'GE'],
  ['Belarus', 'BY'],
  ['Finland', 'FI'],
  ['Bulgaria', 'BG'],
  ['Luxembourg', 'LU'],
  ['Malta', 'MT'],
  ['New Zealand', 'NZ'],
]

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`)
  return res.json()
}

async function getLeaguesForCountry(countryName) {
  const url = `${BASE}/search_all_leagues.php?c=${encodeURIComponent(countryName)}&s=Soccer`
  const data = await fetchJSON(url)
  return (data.countries ?? []).filter(
    // Only top divisions (intDivision 0=first, 1=second, 2=third, 99=cup)
    // Skip obscure lower divisions (intDivision >= 100)
    (l) => parseInt(l.intDivision ?? '0', 10) < 10 || l.intDivision === '99',
  )
}

async function getTeamsForLeague(leagueName) {
  const url = `${BASE}/search_all_teams.php?l=${encodeURIComponent(leagueName)}`
  const data = await fetchJSON(url)
  return data.teams ?? []
}

// Process array in chunks with delay between chunks
async function processChunked(items, chunkSize, delayMs, fn) {
  const results = []
  for (let i = 0; i < items.length; i += chunkSize) {
    if (i > 0) {
      process.stdout.write(`  [waiting ${delayMs / 1000}s rate limit...]\n`)
      await delay(delayMs)
    }
    const chunk = items.slice(i, i + chunkSize)
    const chunkResults = await Promise.all(chunk.map(fn))
    results.push(...chunkResults)
  }
  return results
}

async function main() {
  const leaguesOut = []
  const clubsOut = []
  const seenLeagues = new Set()

  console.log(`Fetching leagues for ${COUNTRIES.length} countries...`)

  // Step 1: get all leagues — 20 countries per batch (20 req / 60s < 30/min)
  await processChunked(COUNTRIES, 20, 62_000, async ([countryName, countryCode]) => {
    try {
      const leagues = await getLeaguesForCountry(countryName)
      for (const l of leagues) {
        if (!seenLeagues.has(l.idLeague)) {
          seenLeagues.add(l.idLeague)
          leaguesOut.push({ id: l.idLeague, name: l.strLeague, country: countryName, countryCode })
        }
      }
      process.stdout.write(`  ${countryName}: ${leagues.length} leagues\n`)
    } catch (err) {
      process.stdout.write(`  ${countryName}: FAILED (${err.message})\n`)
    }
  })

  console.log(`\nTotal leagues: ${leaguesOut.length}. Fetching teams...\n`)

  // Step 2: get teams per league — 20 leagues per batch
  await processChunked(leaguesOut, 20, 62_000, async (league) => {
    try {
      const teams = await getTeamsForLeague(league.name)
      for (const t of teams) {
        clubsOut.push({ name: t.strTeam, leagueName: league.name, countryCode: league.countryCode })
      }
      process.stdout.write(`  ${league.name}: ${teams.length} teams\n`)
    } catch (err) {
      process.stdout.write(`  ${league.name}: FAILED (${err.message})\n`)
    }
  })

  // Sort
  leaguesOut.sort((a, b) => a.country.localeCompare(b.country) || a.name.localeCompare(b.name))
  clubsOut.sort((a, b) => a.leagueName.localeCompare(b.leagueName) || a.name.localeCompare(b.name))

  // Strip internal id before writing
  const leaguesClean = leaguesOut.map(({ name, country, countryCode }) => ({ name, country, countryCode }))

  const leaguesContent = `// Auto-generated by scripts/generate-football-data.mjs — do not edit manually
export interface League {
  name: string
  country: string
  countryCode: string
}

export const LEAGUES: League[] = ${JSON.stringify(leaguesClean, null, 2)}
`

  const clubsContent = `// Auto-generated by scripts/generate-football-data.mjs — do not edit manually
export interface Club {
  name: string
  leagueName: string
  countryCode: string
}

export const CLUBS: Club[] = ${JSON.stringify(clubsOut, null, 2)}
`

  writeFileSync(join(ROOT, 'src/constants/leagues.ts'), leaguesContent, 'utf8')
  writeFileSync(join(ROOT, 'src/constants/clubs.ts'), clubsContent, 'utf8')

  console.log(`\nDone!`)
  console.log(`  Leagues: ${leaguesClean.length}`)
  console.log(`  Clubs:   ${clubsOut.length}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
