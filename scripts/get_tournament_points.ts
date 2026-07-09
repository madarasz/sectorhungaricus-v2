import * as fs from "fs";
import * as path from "path";
import {
  getFactionName,
  sanitizeFactionName,
  loadFactionCache,
} from "./faction-utils";

interface Tournament {
  name: string;
  bcp_id: string;
}

interface TournamentsConfig {
  name: string;
  tournaments: Tournament[];
  scoring: number[];
}

interface PlayerTournamentResult {
  name: string;
  faction: string;
  elo_change: number;
}

interface PlayerResult {
  name: string;
  rank: number;
  elo: number;
  wins: number;
  draws: number;
  losses: number;
  tournaments: PlayerTournamentResult[];
}

interface ResultsOutput {
  players: PlayerResult[];
}

interface BCPUser {
  firstName?: string;
  lastName?: string;
}

interface BCPPairingPlayer {
  id?: string;
  user?: BCPUser;
  faction?: string;
  parentFaction?: string;
}

interface BCPGame {
  id?: string;
  result?: number; // 2=Win, 1=Draw, 0=Loss
  points?: number;
}

interface BCPPairing {
  id?: string;
  round?: number;
  isDone?: boolean;
  created_at?: string;
  player1?: BCPPairingPlayer;
  player2?: BCPPairingPlayer;
  player1Game?: BCPGame;
  player2Game?: BCPGame;
}

interface BCPPairingsResponse {
  active?: BCPPairing[];
  deleted?: BCPPairing[];
}

interface PairingsCache {
  rounds: Record<string, BCPPairing[]>;
}

const STARTING_ELO = 1500;
const K_FACTOR = 50;

async function fetchPairingsForRound(
  bcpId: string,
  round: number
): Promise<BCPPairing[]> {
  const url = `https://newprod-api.bestcoastpairings.com/v1/events/${bcpId}/pairings?eventId=${bcpId}&round=${round}&pairingType=Pairing`;

  const response = await fetch(url, {
    headers: {
      "client-id": "web-app",
      env: "bcp",
      "content-type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch pairings for ${bcpId} round ${round}: ${response.status} ${response.statusText}`
    );
  }

  const data: BCPPairingsResponse = await response.json();
  return data.active || [];
}

async function fetchAndCachePairings(
  tournament: Tournament,
  cacheDir: string
): Promise<PairingsCache> {
  const cachePath = path.join(cacheDir, `${tournament.bcp_id}.json`);

  if (fs.existsSync(cachePath)) {
    console.log(`  Using cached pairings for: ${tournament.name}`);
    return JSON.parse(fs.readFileSync(cachePath, "utf-8"));
  }

  console.log(`  Fetching pairings for: ${tournament.name}`);
  const rounds: Record<string, BCPPairing[]> = {};

  for (let round = 1; round <= 20; round++) {
    try {
      const pairings = await fetchPairingsForRound(tournament.bcp_id, round);
      if (pairings.length === 0) {
        break;
      }
      rounds[String(round)] = pairings;
      console.log(`    Round ${round}: ${pairings.length} pairings`);
    } catch (error) {
      if (round === 1) {
        console.warn(
          `  WARNING: Could not fetch pairings for ${tournament.name}. Creating template for manual fill.`
        );
        console.warn(`  Please fill in: ${cachePath}`);
        const template: PairingsCache = { rounds: {} };
        fs.writeFileSync(cachePath, JSON.stringify(template, null, 4));
        return template;
      }
      // Later rounds failing means we've passed the last round
      break;
    }
  }

  const cache: PairingsCache = { rounds };
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 4));
  return cache;
}

function getPlayerName(player: BCPPairingPlayer): string {
  const firstName = player.user?.firstName || "";
  const lastName = player.user?.lastName || "";
  return `${firstName} ${lastName}`.trim();
}

// Workaround for swapped player names in BCP (e.g. "John Doe" vs "Doe John")
function sanitizePlayerName(name: string): string {
  if (name === "Vince Balázs Soós") return "Vince Soós";
  if (name === "Vince  Soós") return "Vince Soós";
  if (name === "Marton Mati") return "Márton Mati";
  if (name === "Gabor Kiss") return "Gábor Kiss";
  if (name === "SANDOR TAMAS BALOGH") return "Sándor Tamás Balogh";
  if (name === "Szarvas Dominik") return "Dominik Szarvas";
  if (name === "Bence Gombás") return "Gombás Bence";
  return name;
}

function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function updateElo(rating: number, expected: number, actual: number): number {
  return Math.round(rating + K_FACTOR * (actual - expected));
}

function getEarliestPairingDate(cache: PairingsCache): string {
  const dates = Object.values(cache.rounds)
    .flat()
    .map((p) => p.created_at)
    .filter(Boolean) as string[];
  return dates.length ? dates.sort()[0] : "9999";
}

async function main(): Promise<void> {
  const scriptsDir = path.dirname(__filename);
  const tournamentsPath = path.join(scriptsDir, "tournaments-2026.json");
  const resultsPath = path.join(scriptsDir, "results-2026.json");
  const cacheDir = path.join(scriptsDir, "cache", "pairings");

  fs.mkdirSync(cacheDir, { recursive: true });

  const tournamentsConfig: TournamentsConfig = JSON.parse(
    fs.readFileSync(tournamentsPath, "utf-8")
  );

  // Build cache map and sort tournaments by earliest pairing timestamp
  const cacheMap = new Map<string, PairingsCache>();
  for (const t of tournamentsConfig.tournaments) {
    await loadFactionCache(t.bcp_id, cacheDir);
    cacheMap.set(t.bcp_id, await fetchAndCachePairings(t, cacheDir));
  }

  const tournaments = [...tournamentsConfig.tournaments].sort((a, b) =>
    getEarliestPairingDate(cacheMap.get(a.bcp_id)!).localeCompare(
      getEarliestPairingDate(cacheMap.get(b.bcp_id)!)
    )
  );

  const eloMap = new Map<string, number>();
  const playerMap = new Map<string, PlayerResult>();

  function getOrInitPlayer(name: string): PlayerResult {
    if (!playerMap.has(name)) {
      playerMap.set(name, {
        name,
        rank: 0,
        elo: STARTING_ELO,
        wins: 0,
        draws: 0,
        losses: 0,
        tournaments: [],
      });
      eloMap.set(name, STARTING_ELO);
    }
    return playerMap.get(name)!;
  }

  for (const tournament of tournaments) {
    console.log(`\nProcessing: ${tournament.name}`);

    const cache = cacheMap.get(tournament.bcp_id)!;
    const roundNumbers = Object.keys(cache.rounds)
      .map(Number)
      .sort((a, b) => a - b);

    if (roundNumbers.length === 0) {
      console.log(`  No pairing data available, skipping.`);
      continue;
    }

    // Track per-tournament ELO change and factions per player
    const tournamentEloChange = new Map<string, number>();
    const tournamentFaction = new Map<string, string>();

    for (const round of roundNumbers) {
      const pairings = cache.rounds[String(round)];

      for (const pairing of pairings) {
        if (!pairing.isDone) continue;
        if (!pairing.player1 || !pairing.player2) continue;
        if (!pairing.player1Game || !pairing.player2Game) continue;

        const name1 = sanitizePlayerName(getPlayerName(pairing.player1));
        const name2 = sanitizePlayerName(getPlayerName(pairing.player2));
        if (!name1 || !name2) continue;

        const result1 = pairing.player1Game.result;
        const result2 = pairing.player2Game.result;
        if (result1 === undefined || result2 === undefined) continue;

        getOrInitPlayer(name1);
        getOrInitPlayer(name2);

        const faction1 = sanitizeFactionName(
          getFactionName(pairing.player1.faction, name1, tournament.bcp_id),
          tournament.name
        );
        const faction2 = sanitizeFactionName(
          getFactionName(pairing.player2.faction, name2, tournament.bcp_id),
          tournament.name
        );

        // Update faction (last seen per tournament)
        tournamentFaction.set(name1, faction1);
        tournamentFaction.set(name2, faction2);

        const elo1 = eloMap.get(name1)!;
        const elo2 = eloMap.get(name2)!;

        const exp1 = expectedScore(elo1, elo2);
        const exp2 = expectedScore(elo2, elo1);

        // result: 2=Win, 1=Draw, 0=Loss
        const score1 = result1 === 2 ? 1 : result1 === 1 ? 0.5 : 0;
        const score2 = result2 === 2 ? 1 : result2 === 1 ? 0.5 : 0;

        const newElo1 = updateElo(elo1, exp1, score1);
        const newElo2 = updateElo(elo2, exp2, score2);

        eloMap.set(name1, newElo1);
        eloMap.set(name2, newElo2);

        tournamentEloChange.set(
          name1,
          (tournamentEloChange.get(name1) || 0) + (newElo1 - elo1)
        );
        tournamentEloChange.set(
          name2,
          (tournamentEloChange.get(name2) || 0) + (newElo2 - elo2)
        );

        // Record wins/draws/losses
        const p1 = playerMap.get(name1)!;
        const p2 = playerMap.get(name2)!;

        if (result1 === 2) {
          p1.wins++;
          p2.losses++;
        } else if (result1 === 1) {
          p1.draws++;
          p2.draws++;
        } else {
          p1.losses++;
          p2.wins++;
        }
      }
    }

    // Commit ELO to player results and record tournament
    for (const [name] of tournamentEloChange) {
      const player = playerMap.get(name)!;
      player.elo = eloMap.get(name)!;
      player.tournaments.push({
        name: tournament.name,
        faction: tournamentFaction.get(name) || "Unknown",
        elo_change: tournamentEloChange.get(name) || 0,
      });
    }
  }

  // Sort by ELO descending and assign ranks (ties share rank)
  const playersArray = Array.from(playerMap.values()).sort(
    (a, b) => b.elo - a.elo
  );

  let rankCounter = 0;
  let prevEloForRank = -1;
  for (let i = 0; i < playersArray.length; i++) {
    if (playersArray[i].elo !== prevEloForRank) {
      rankCounter = i + 1;
      prevEloForRank = playersArray[i].elo;
    }
    playersArray[i].rank = rankCounter;
  }

  const results: ResultsOutput = {
    players: playersArray,
  };

  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 4));

  console.log(`\nResults written to ${resultsPath}`);
  console.log(`Total players: ${playersArray.length}`);

  console.log("\nAll players:");
  let rank = 0;
  let prevElo = -1;
  playersArray.forEach((player, index) => {
    if (player.elo !== prevElo) { rank = index + 1; prevElo = player.elo; }
    const record = `${player.wins}W/${player.draws}D/${player.losses}L`;
    console.log(
      `  ${rank}. ${player.name}: ${player.elo} ELO (${record}, ${player.tournaments.length} tournaments)`
    );
  });
}

main().catch(console.error);
