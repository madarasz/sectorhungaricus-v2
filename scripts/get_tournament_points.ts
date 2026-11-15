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
  // Minimum number of tournaments to get into the ranking table
  min_tournaments?: number;
}

interface PlayerTournamentResult {
  name: string;
  faction: string;
  elo_change: number;
}

interface PlayerResult {
  // BCP user ID (after ID_ALIASES)
  id: string;
  name: string;
  rank: number;
  elo: number;
  wins: number;
  draws: number;
  losses: number;
  tournaments: PlayerTournamentResult[];
}

interface SeasonResult {
  id: string;
  min_tournaments: number;
  tournaments: Tournament[];
  players: PlayerResult[];
}

interface ResultsOutput {
  seasons: SeasonResult[];
}

interface BCPUser {
  // BCP account ID: stable across events and name changes
  id?: string;
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
  updated_at?: string;
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
const DEFAULT_MIN_TOURNAMENTS = 3;
const ALL_TIME_SEASON_ID = "all-time";

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
  return `${firstName} ${lastName}`.replace(/\s+/g, " ").trim();
}

// One person with more than one BCP account: old user ID -> kept user ID
const ID_ALIASES: Record<string, string> = {
  MEY0buOmpcFb: "8CNWfK1ydjAc", // Lőrinc Soós
};

// Display name override per BCP user ID. Without an override, the name from
// the player's most recent tournament is shown.
const DISPLAY_NAMES: Record<string, string> = {
  "5lJp3NUIc67s": "Vince Soós",
  "7BA37A23AG": "Márton Mati",
  cOHk4iYN1y4p: "Dávid Viniczay",
  vE9a72A3rk: "Gábor Kiss",
  "28GpmgXa6K3d": "Sándor Tamás Balogh",
  LAkP193dbQ4s: "Dominik Szarvas",
  M60FB4YA4K: "Gombás Bence",
  xhzwId2YZ7: "Lóránd “Clostry” Papp",
  Z1jtDyM2tgib: "Ádám Kriza",
  LF2VQKJL82: "Gábor Mervó",
  // Two "Dávid Nagy" accounts (both in zW3xj5MBgRl8): this one plays Canoptek Circle
  QBBHPWYKDP: 'Dávid "Shurama" Nagy',
};

function getPlayerId(player: BCPPairingPlayer): string {
  const id = player.user?.id || "";
  return ID_ALIASES[id] ?? id;
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

interface Season {
  id: string;
  tournaments: Tournament[];
  min_tournaments: number;
}

function loadSeasons(scriptsDir: string): Season[] {
  return fs
    .readdirSync(scriptsDir)
    .map((file) => file.match(/^tournaments-(\d{4})\.json$/))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map((match) => {
      const config: TournamentsConfig = JSON.parse(
        fs.readFileSync(path.join(scriptsDir, match[0]), "utf-8")
      );
      return {
        id: match[1],
        tournaments: config.tournaments,
        min_tournaments: config.min_tournaments ?? DEFAULT_MIN_TOURNAMENTS,
      };
    })
    .sort((a, b) => b.id.localeCompare(a.id));
}

// Valid pairings of a tournament: finished, both players and results known.
// Both results zero means the match did not actually happen (there is no
// such thing as a double-loss), so it is skipped.
function getPlayedPairings(cache: PairingsCache): BCPPairing[] {
  return Object.keys(cache.rounds)
    .map(Number)
    .sort((a, b) => a - b)
    .flatMap((round) => cache.rounds[String(round)])
    .filter(
      (p) =>
        p.isDone &&
        p.player1 &&
        p.player2 &&
        getPlayerId(p.player1) &&
        getPlayerId(p.player2) &&
        p.player1Game?.result !== undefined &&
        p.player2Game?.result !== undefined &&
        !(p.player1Game.result === 0 && p.player2Game.result === 0)
    );
}

// Display name per player ID: override, else name in the most recent tournament
function buildDisplayNames(
  chronological: Tournament[],
  cacheMap: Map<string, PairingsCache>
): Map<string, string> {
  const names = new Map<string, string>();
  for (const t of chronological) {
    for (const p of getPlayedPairings(cacheMap.get(t.bcp_id)!)) {
      for (const player of [p.player1!, p.player2!]) {
        names.set(getPlayerId(player), getPlayerName(player));
      }
    }
  }
  for (const [id, name] of Object.entries(DISPLAY_NAMES)) {
    names.set(ID_ALIASES[id] ?? id, name);
  }
  return names;
}

function calculateElo(
  tournaments: Tournament[],
  cacheMap: Map<string, PairingsCache>,
  displayNames: Map<string, string>
): PlayerResult[] {
  const eloMap = new Map<string, number>();
  const playerMap = new Map<string, PlayerResult>();

  function getOrInitPlayer(id: string): PlayerResult {
    if (!playerMap.has(id)) {
      playerMap.set(id, {
        id,
        name: displayNames.get(id)!,
        rank: 0,
        elo: STARTING_ELO,
        wins: 0,
        draws: 0,
        losses: 0,
        tournaments: [],
      });
      eloMap.set(id, STARTING_ELO);
    }
    return playerMap.get(id)!;
  }

  for (const tournament of tournaments) {
    const pairings = getPlayedPairings(cacheMap.get(tournament.bcp_id)!);

    if (pairings.length === 0) {
      console.log(`  No pairing data for ${tournament.name}, skipping.`);
      continue;
    }

    // Track per-tournament ELO change and factions per player
    const tournamentEloChange = new Map<string, number>();
    const tournamentFaction = new Map<string, string>();

    for (const pairing of pairings) {
      const id1 = getPlayerId(pairing.player1!);
      const id2 = getPlayerId(pairing.player2!);
      const result1 = pairing.player1Game!.result!;
      const result2 = pairing.player2Game!.result!;

      getOrInitPlayer(id1);
      getOrInitPlayer(id2);

      // Players API faction cache is keyed by the raw BCP name of the event
      const faction1 = sanitizeFactionName(
        getFactionName(
          pairing.player1!.faction,
          getPlayerName(pairing.player1!),
          tournament.bcp_id
        ),
        tournament.name
      );
      const faction2 = sanitizeFactionName(
        getFactionName(
          pairing.player2!.faction,
          getPlayerName(pairing.player2!),
          tournament.bcp_id
        ),
        tournament.name
      );

      // Update faction (last seen per tournament)
      tournamentFaction.set(id1, faction1);
      tournamentFaction.set(id2, faction2);

      const elo1 = eloMap.get(id1)!;
      const elo2 = eloMap.get(id2)!;

      const exp1 = expectedScore(elo1, elo2);
      const exp2 = expectedScore(elo2, elo1);

      // result: 2=Win, 1=Draw, 0=Loss
      const score1 = result1 === 2 ? 1 : result1 === 1 ? 0.5 : 0;
      const score2 = result2 === 2 ? 1 : result2 === 1 ? 0.5 : 0;

      const newElo1 = updateElo(elo1, exp1, score1);
      const newElo2 = updateElo(elo2, exp2, score2);

      eloMap.set(id1, newElo1);
      eloMap.set(id2, newElo2);

      tournamentEloChange.set(
        id1,
        (tournamentEloChange.get(id1) || 0) + (newElo1 - elo1)
      );
      tournamentEloChange.set(
        id2,
        (tournamentEloChange.get(id2) || 0) + (newElo2 - elo2)
      );

      // Record wins/draws/losses
      const p1 = playerMap.get(id1)!;
      const p2 = playerMap.get(id2)!;

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

    // Commit ELO to player results and record tournament
    for (const [id] of tournamentEloChange) {
      const player = playerMap.get(id)!;
      player.elo = eloMap.get(id)!;
      player.tournaments.push({
        name: tournament.name,
        faction: tournamentFaction.get(id) || "Unknown",
        elo_change: tournamentEloChange.get(id) || 0,
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

  return playersArray;
}

// ELO is calculated in chronological order
function sortChronologically(
  tournaments: Tournament[],
  cacheMap: Map<string, PairingsCache>
): Tournament[] {
  const earliestDate = (t: Tournament) =>
    getEarliestPairingDate(cacheMap.get(t.bcp_id)!);
  return [...tournaments].sort((a, b) =>
    earliestDate(a).localeCompare(earliestDate(b))
  );
}

function buildSeasonResult(
  id: string,
  minTournaments: number,
  tournaments: Tournament[],
  cacheMap: Map<string, PairingsCache>,
  displayNames: Map<string, string>
): SeasonResult {
  const chronological = sortChronologically(tournaments, cacheMap);

  console.log(`\nSeason ${id}: ${tournaments.length} tournaments`);
  const players = calculateElo(chronological, cacheMap, displayNames);

  return {
    id,
    min_tournaments: minTournaments,
    // Tournament with the most recent last match first
    tournaments: [...tournaments]
      .sort((a, b) =>
        getLastMatchDate(cacheMap.get(b.bcp_id)!).localeCompare(
          getLastMatchDate(cacheMap.get(a.bcp_id)!)
        )
      )
      .map(({ name, bcp_id }) => ({ name, bcp_id })),
    players,
  };
}

// Time of the last played match: the last result update of a finished pairing
function getLastMatchDate(cache: PairingsCache): string {
  const dates = Object.values(cache.rounds)
    .flat()
    .filter((p) => p.isDone)
    .map((p) => p.updated_at || p.created_at)
    .filter(Boolean) as string[];
  return dates.length ? dates.sort()[dates.length - 1] : "";
}

async function main(): Promise<void> {
  const scriptsDir = path.dirname(__filename);
  const resultsPath = path.join(scriptsDir, "results.json");
  const cacheDir = path.join(scriptsDir, "cache", "pairings");

  fs.mkdirSync(cacheDir, { recursive: true });

  const seasons = loadSeasons(scriptsDir);
  const allTournaments = seasons.flatMap((season) => season.tournaments);

  const cacheMap = new Map<string, PairingsCache>();
  for (const t of allTournaments) {
    if (cacheMap.has(t.bcp_id)) continue;
    await loadFactionCache(t.bcp_id, cacheDir);
    cacheMap.set(t.bcp_id, await fetchAndCachePairings(t, cacheDir));
  }

  // Same display name in every season: name in the most recent tournament
  const displayNames = buildDisplayNames(
    sortChronologically(allTournaments, cacheMap),
    cacheMap
  );

  const results: ResultsOutput = {
    seasons: [
      ...seasons.map((season) =>
        buildSeasonResult(
          season.id,
          season.min_tournaments,
          season.tournaments,
          cacheMap,
          displayNames
        )
      ),
      buildSeasonResult(
        ALL_TIME_SEASON_ID,
        DEFAULT_MIN_TOURNAMENTS,
        allTournaments,
        cacheMap,
        displayNames
      ),
    ],
  };

  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 4));

  console.log(`\nResults written to ${resultsPath}`);
  for (const season of results.seasons) {
    const eligible = season.players.filter(
      (p) => p.tournaments.length >= season.min_tournaments
    ).length;
    console.log(
      `  ${season.id}: ${season.players.length} players, ${eligible} with at least ${season.min_tournaments} tournaments`
    );
  }

  // All-time list contains every player: use it to find duplicate names
  const allTime = results.seasons[results.seasons.length - 1];
  console.log("\nAll players (all-time):");
  for (const player of allTime.players) {
    const record = `${player.wins}W/${player.draws}D/${player.losses}L`;
    console.log(
      `  ${player.rank}. ${player.name} [${player.id}]: ${player.elo} ELO (${record}, ${player.tournaments.length} tournaments)`
    );
  }
}

main().catch(console.error);
