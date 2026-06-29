import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MATCH_ID = 'eng-aus-t20-2025-11-24'
const MATCH_START = new Date('2025-11-24T19:00:00')

const ENG_PLAYERS = [
  { name: 'Jos Buttler', id: 'buttler_j', role: 'Wicketkeeper-Batter' },
  { name: 'Dawid Malan', id: 'malan_d', role: 'Batter' },
  { name: 'Ben Stokes', id: 'stokes_b', role: 'All-rounder' },
  { name: 'Harry Brook', id: 'brook_h', role: 'Batter' },
  { name: 'Moeen Ali', id: 'moeen_a', role: 'All-rounder' },
  { name: 'Chris Woakes', id: 'woakes_c', role: 'Bowler' },
  { name: 'Mark Wood', id: 'wood_m', role: 'Bowler' },
  { name: 'Adil Rashid', id: 'rashid_a', role: 'Bowler' },
  { name: 'Jofra Archer', id: 'archer_j', role: 'Bowler' },
  { name: 'Sam Curran', id: 'curran_s', role: 'All-rounder' },
  { name: 'Jonny Bairstow', id: 'bairstow_j', role: 'Batter' },
]

const AUS_PLAYERS = [
  { name: 'David Warner', id: 'warner_d', role: 'Batter' },
  { name: 'Aaron Finch', id: 'finch_a', role: 'Batter' },
  { name: 'Steve Smith', id: 'smith_s', role: 'Batter' },
  { name: 'Glenn Maxwell', id: 'maxwell_g', role: 'All-rounder' },
  { name: 'Marcus Stoinis', id: 'stoinis_m', role: 'All-rounder' },
  { name: 'Mitchell Marsh', id: 'marsh_m', role: 'All-rounder' },
  { name: 'Pat Cummins', id: 'cummins_p', role: 'Bowler' },
  { name: 'Mitchell Starc', id: 'starc_m', role: 'Bowler' },
  { name: 'Adam Zampa', id: 'zampa_a', role: 'Bowler' },
  { name: 'Josh Hazlewood', id: 'hazlewood_j', role: 'Bowler' },
  { name: 'Matthew Wade', id: 'wade_m', role: 'Wicketkeeper-Batter' },
]

const COMMENTARY_LINES = [
  'Driven through covers for a boundary!',
  'Dot ball — good line and length from the bowler.',
  'Pulled away to the leg side, one run.',
  'Massive six over long-on! The crowd erupts.',
  'Appeal for LBW — turned down by the umpire.',
  'Quick single stolen, excellent running between the wickets.',
  'Edged and taken at slip! WICKET!',
  'Slower ball deceives the batter, bowled him!',
  'Full toss punished — four runs to deep midwicket.',
  'Yorker at the base of off stump, well dug out.',
]

function ts(minutesOffset) {
  const d = new Date(MATCH_START.getTime() + minutesOffset * 60000)
  return d.toISOString().slice(0, 19)
}

function writeJson(name, data) {
  writeFileSync(join(__dirname, name), JSON.stringify(data, null, 2))
  console.log(`  wrote ${name}`)
}

function generateMatchMetadata() {
  return {
    match_id: MATCH_ID,
    series: 'England vs Australia T20 Series 2025',
    match_number: 3,
    format: 'T20',
    date: '2025-11-24',
    venue: 'Melbourne Cricket Ground',
    city: 'Melbourne',
    country: 'Australia',
    toss: { winner: 'England', decision: 'bat' },
    teams: {
      team1: { name: 'England', captain: 'Jos Buttler', wicketkeeper: 'Jos Buttler', players: ENG_PLAYERS },
      team2: { name: 'Australia', captain: 'Aaron Finch', wicketkeeper: 'Matthew Wade', players: AUS_PLAYERS },
    },
    umpires: [
      { name: 'Kumar Dharmasena', role: 'On-field' },
      { name: 'Marais Erasmus', role: 'On-field' },
    ],
    innings: [{
      number: 2,
      batting_team: 'Australia',
      bowling_team: 'England',
      total_runs: 142,
      total_wickets: 4,
      total_overs: 17.3,
      target: 180,
      extras: 8,
      boundaries: { fours: 12, sixes: 5 },
      note: 'Australia chasing 180 in a tense run chase',
    }],
    result: {
      status: 'live',
      note: 'Australia need 38 runs from 15 balls',
      projected_winner: 'Australia',
      projected_margin: 'narrow',
    },
    data_source: 'mock',
  }
}

function generateSentiment() {
  const players = [...ENG_PLAYERS, ...AUS_PLAYERS]
  const sentiments = []
  for (let i = 0; i < 80; i++) {
    const score = Math.round((Math.random() * 2 - 1) * 1000) / 1000
    const label = score > 0.3 ? 'positive' : score < -0.3 ? 'negative' : 'neutral'
    const player = players[i % players.length]
    sentiments.push({
      match_id: MATCH_ID,
      player_id: player.id,
      team_id: ENG_PLAYERS.includes(player) ? 'england' : 'australia',
      timestamp: ts(i * 1.5),
      sentiment_score: score,
      sentiment_label: label,
      mention_count: Math.floor(Math.random() * 480) + 20,
      source: 'twitter',
    })
  }
  return sentiments
}

function pickRuns() {
  const weights = [30, 35, 15, 15, 5]
  const outcomes = [0, 1, 2, 4, 6]
  const r = Math.random() * 100
  let cum = 0
  for (let i = 0; i < outcomes.length; i++) {
    cum += weights[i]
    if (r < cum) return outcomes[i]
  }
  return 0
}

function simulateInnings() {
  const stats = [], commentary = [], wickets = [], physics = [], bowlerStats = []
  let runs = 0, wicketsCount = 0, ballIndex = 0
  const wicketOvers = { 5: 'caught', 10: 'bowled', 14: 'lbw' }
  const engBowlerIds = ['wood_m', 'archer_j', 'rashid_a', 'woakes_c']

  for (let over = 1; over <= 17; over++) {
    for (let ball = 1; ball <= 6; ball++) {
      if (over === 17 && ball > 3) break
      ballIndex++
      const minutes = 90 + over * 3 + ball * 0.4
      let runsThisBall = pickRuns()

      if (wicketOvers[over] && ball === 3 && wicketsCount < 4) {
        runsThisBall = 0
        wicketsCount++
        wickets.push({
          event_id: `WKT_${wickets.length + 1}`,
          event_type: 'wicket',
          sub_type: wicketOvers[over],
          match_id: MATCH_ID,
          innings: 2,
          over_number: over,
          ball_number: ball,
          timestamp: ts(minutes),
          dismissal_type: wicketOvers[over],
        })
      } else {
        runs += runsThisBall
      }

      const oversFloat = Math.round((over + ball / 10) * 10) / 10
      stats.push({
        event_id: `STAT_${ballIndex}`,
        event_type: 'match_statistics',
        sub_type: 'over_summary',
        match_id: MATCH_ID,
        innings: 2,
        over_number: over,
        ball_number: ball,
        timestamp: ts(minutes),
        team_stats: {
          australia: { runs, wickets: wicketsCount, overs: oversFloat },
          england: { runs: 179, wickets: 6, overs: 20.0 },
        },
        run_rate: Math.round((runs / Math.max(oversFloat, 0.1)) * 100) / 100,
        required_run_rate: Math.round(((180 - runs) / Math.max(20 - oversFloat, 0.1)) * 100) / 100,
      })

      if (ballIndex % 3 === 0) {
        commentary.push({
          event_id: `COMM_${commentary.length + 1}`,
          event_type: 'commentary',
          sub_type: 'ball_commentary',
          match_id: MATCH_ID,
          innings: 2,
          over_number: over,
          ball_number: ball,
          timestamp: ts(minutes),
          commentary_text: `Over ${over}.${ball}: ${COMMENTARY_LINES[ballIndex % COMMENTARY_LINES.length]}`,
          commentator: ['Ian Smith', 'Michael Slater', 'Isa Guha'][ballIndex % 3],
        })
      }

      if (ballIndex % 4 === 0) {
        const bowlerId = engBowlerIds[ballIndex % engBowlerIds.length]
        const bowlerName = ENG_PLAYERS.find((p) => p.id === bowlerId)?.name
        physics.push({
          event_id: `PHYS_${physics.length + 1}`,
          event_type: 'physics',
          sub_type: 'ball_release',
          match_id: MATCH_ID,
          innings: 2,
          over_number: over,
          ball_number: ball,
          timestamp: ts(minutes),
          bowler_id: bowlerId,
          release_speed_kmh: Math.round((125 + Math.random() * 25) * 10) / 10,
        })
        bowlerStats.push({
          event_id: `BOWL_${bowlerStats.length + 1}`,
          event_type: 'bowler_stats',
          match_id: MATCH_ID,
          timestamp: ts(minutes),
          bowler_id: bowlerId,
          bowler_name: bowlerName,
          release_speed_kmh: Math.round((125 + Math.random() * 25) * 10) / 10,
          spin_rpm: Math.round(800 + Math.random() * 2000),
          fatigue_level: Math.round(Math.random() * 60 + 20) / 100,
          accuracy_score: Math.round((60 + Math.random() * 35)) / 100,
        })
      }
    }
  }
  return { stats, commentary, wickets, physics, bowlerStats }
}

function generateBiometrics() {
  return [...ENG_PLAYERS, ...AUS_PLAYERS].map((player, i) => ({
    event_id: `BIO_${i + 1}`,
    event_type: 'player_biometric',
    match_id: MATCH_ID,
    timestamp: ts(30 + i * 2),
    player_id: player.id,
    player_role: player.role,
    heart_rate_bpm: Math.floor(Math.random() * 65) + 110,
    energy_level: Math.round((40 + Math.random() * 55)) / 100,
    muscle_fatigue_index: Math.round((10 + Math.random() * 60)) / 100,
  }))
}

function minimalFeed(eventType, subType, count = 15) {
  return Array.from({ length: count }, (_, i) => ({
    event_id: `${eventType.toUpperCase()}_${i + 1}`,
    event_type: eventType,
    sub_type: subType,
    match_id: MATCH_ID,
    innings: 2,
    over_number: (i % 17) + 1,
    ball_number: (i % 6) + 1,
    timestamp: ts(60 + i * 3),
  }))
}

console.log('Generating cricket mock data...')
writeJson('match-metadata.json', generateMatchMetadata())
writeJson('sentiment-mock.json', generateSentiment())
const { stats, commentary, wickets, physics, bowlerStats } = simulateInnings()
writeJson('match-statistics-feed.json', stats)
writeJson('commentary-feed.json', commentary)
writeJson('wicket-feed.json', wickets)
writeJson('physics-feed.json', physics)
writeJson('bowler-stats-feed.json', bowlerStats)
writeJson('player-biometric-feed.json', generateBiometrics())
writeJson('fielder-feed.json', minimalFeed('fielder', 'catch_attempt'))
writeJson('umpire-decisions-feed.json', minimalFeed('umpire_decision', 'lbw_review'))
writeJson('crowd-reactions-feed.json', minimalFeed('crowd_reaction', 'cheer'))
writeJson('equipment-sensor-feed.json', minimalFeed('equipment_sensor', 'bat_impact'))
mkdirSync(join(__dirname, 'media'), { recursive: true })
console.log('Done!')
