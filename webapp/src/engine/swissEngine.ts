import type { Player, Game, Tournament, GamePrediction } from '@/types/tournament'

export function calculateStandings(players: Player[], allGames: Game[]): Player[] {
  const updated = players.map(p => ({ ...p, wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, buchholzScore: 0 }))
  const playerMap = new Map(updated.map(p => [p.id, p]))

  for (const game of allGames) {
    if (!game.confirmed) continue
    const p1 = playerMap.get(game.player1Id)
    if (!p1) continue
    if (game.player2Id === null) { p1.wins += 1; continue }
    const p2 = playerMap.get(game.player2Id)
    if (!p2) continue
    if (game.points1 > game.points2) { p1.wins += 1; p2.losses += 1 }
    else if (game.points1 < game.points2) { p2.wins += 1; p1.losses += 1 }
    p1.pointsFor += game.points1; p1.pointsAgainst += game.points2
    p2.pointsFor += game.points2; p2.pointsAgainst += game.points1
  }

  for (const player of updated) {
    let score = 0
    for (const game of allGames) {
      if (!game.confirmed) continue
      let opponentId: string | null = null
      if (game.player1Id === player.id) opponentId = game.player2Id
      else if (game.player2Id === player.id) opponentId = game.player1Id
      else continue
      if (opponentId === null) continue
      const opponent = playerMap.get(opponentId)
      if (opponent) score += opponent.wins
    }
    player.buchholzScore = score
  }

  return updated.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins
    if (b.buchholzScore !== a.buchholzScore) return b.buchholzScore - a.buchholzScore
    return a.pointsAgainst - b.pointsAgainst
  })
}

export function havePlayed(p1Id: string, p2Id: string, games: Game[]): boolean {
  return games.some(g => (g.player1Id === p1Id && g.player2Id === p2Id) || (g.player1Id === p2Id && g.player2Id === p1Id))
}

export function generateNextRoundPairings(players: Player[], allGames: Game[], prePairedGames: Game[] = []): Game[] {
  const sorted = [...players].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins
    if (b.buchholzScore !== a.buchholzScore) return b.buchholzScore - a.buchholzScore
    return a.pointsAgainst - b.pointsAgainst
  })

  const prePairedIds = new Set(prePairedGames.flatMap(g => [g.player1Id, g.player2Id].filter((id): id is string => id !== null)))
  let unpaired = sorted.filter(p => !prePairedIds.has(p.id))
  const games: Game[] = [...prePairedGames]

  if (unpaired.length % 2 === 1) {
    const byePlayer = [...unpaired].reverse().find(p => !p.hadBye) ?? unpaired[unpaired.length - 1]
    unpaired = unpaired.filter(p => p.id !== byePlayer.id)
    games.push({ player1Id: byePlayer.id, player2Id: null, points1: 1, points2: 0, confirmed: true })
  }

  while (unpaired.length > 1) {
    const p1 = unpaired.shift()!
    let idx = unpaired.findIndex(p2 => !havePlayed(p1.id, p2.id, allGames))
    if (idx === -1) idx = 0
    const p2 = unpaired.splice(idx, 1)[0]
    games.push({ player1Id: p1.id, player2Id: p2.id, points1: 0, points2: 0, confirmed: false })
  }

  return games
}

function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]]
  const [first, ...rest] = arrays
  const restProduct = cartesianProduct(rest)
  return first.flatMap(item => restProduct.map(combo => [item, ...combo]))
}

export function predictNextRound(tournament: Tournament, pointsForWin = 4, topN = 20): GamePrediction[] {
  if (tournament.rounds.length === 0) return []

  const lastRound = tournament.rounds[tournament.rounds.length - 1]
  let unfinished = lastRound.games.filter(g => !g.confirmed && g.player2Id !== null)
  if (unfinished.length > 6) unfinished = unfinished.slice(0, 6)

  const confirmedGames: Game[] = tournament.rounds.flatMap(r => r.games.filter(g => g.confirmed))

  if (unfinished.length === 0) {
    const standings = calculateStandings(tournament.players, confirmedGames)
    const pairings = generateNextRoundPairings(standings, confirmedGames)
    return pairings.map(g => ({ player1Id: g.player1Id, player2Id: g.player2Id, confidence: 1.0 }))
  }

  const outcomeOptions = unfinished.map(g => {
    const outcomes: Array<{ p1Id: string; p2Id: string; pts1: number; pts2: number }> = []
    for (let loserPts = 0; loserPts < pointsForWin; loserPts++) {
      outcomes.push({ p1Id: g.player1Id, p2Id: g.player2Id!, pts1: pointsForWin, pts2: loserPts })
      outcomes.push({ p1Id: g.player1Id, p2Id: g.player2Id!, pts1: loserPts, pts2: pointsForWin })
    }
    return outcomes
  })

  const allScenarios = cartesianProduct(outcomeOptions)
  const pairingCounts = new Map<string, number>()

  for (const scenario of allScenarios) {
    const scenarioGames: Game[] = confirmedGames.map(g => ({ ...g }))
    for (const outcome of scenario) {
      scenarioGames.push({ player1Id: outcome.p1Id, player2Id: outcome.p2Id, points1: outcome.pts1, points2: outcome.pts2, confirmed: true })
    }
    const standings = calculateStandings(tournament.players, scenarioGames)
    const pairings = generateNextRoundPairings(standings, scenarioGames)
    for (const game of pairings) {
      if (game.player2Id === null) continue
      const key = [game.player1Id, game.player2Id].sort().join('|')
      pairingCounts.set(key, (pairingCounts.get(key) ?? 0) + 1)
    }
  }

  const total = allScenarios.length
  const predictions: GamePrediction[] = Array.from(pairingCounts.entries()).map(([key, count]) => {
    const [p1Id, p2Id] = key.split('|')
    return { player1Id: p1Id, player2Id: p2Id, confidence: count / total }
  })

  predictions.sort((a, b) => b.confidence - a.confidence)
  return predictions.slice(0, topN)
}
