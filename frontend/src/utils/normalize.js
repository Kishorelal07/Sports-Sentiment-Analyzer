/** Normalize API responses that mix camelCase and snake_case fields. */

export function normalizeInnings(innings = []) {
  return innings.map((inn) => ({
    ...inn,
    battingTeam: inn.battingTeam || inn.batting_team,
    bowlingTeam: inn.bowlingTeam || inn.bowling_team,
    totalRuns: inn.totalRuns ?? inn.total_runs,
    totalWickets: inn.totalWickets ?? inn.total_wickets,
    totalOvers: inn.totalOvers ?? inn.total_overs,
  }))
}

export function normalizeMatch(match) {
  if (!match) return match
  return {
    ...match,
    matchId: match.matchId || match.match_id,
    innings: normalizeInnings(match.innings || []),
    result: match.result
      ? {
          ...match.result,
          projectedWinner: match.result.projectedWinner || match.result.projected_winner,
          projectedMargin: match.result.projectedMargin || match.result.projected_margin,
        }
      : match.result,
  }
}

export function resolveMatchId(matchOrId) {
  if (!matchOrId) return null
  if (typeof matchOrId === 'string') return matchOrId
  return matchOrId.matchId || matchOrId.match_id || matchOrId.id || null
}
