import * as fs from "fs";
import * as path from "path";

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
  rank: number;
  score: number;
  faction: string;
}

interface PlayerResult {
  name: string;
  total_score: number;
  tournaments: PlayerTournamentResult[];
}

interface ResultsOutput {
  players: PlayerResult[];
}

interface BCPPlayer {
  placing?: number;
  faction?: {
    name?: string;
  };
  user?: {
    firstName?: string;
    lastName?: string;
  };
}

interface BCPResponse {
  active?: BCPPlayer[];
}

async function fetchTournamentPlayers(bcpId: string): Promise<BCPPlayer[]> {
  const url = `https://newprod-api.bestcoastpairings.com/v1/events/${bcpId}/players?placings=true`;

  const response = await fetch(url, {
    headers: {
      "client-id": "web-app",
      env: "bcp",
      "content-type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch tournament ${bcpId}: ${response.status} ${response.statusText}`
    );
  }

  const data: BCPResponse = await response.json();
  return data.active || [];
}

function calculateScore(placing: number, scoring: number[]): number {
  // placing is 1-indexed, scoring array is 0-indexed
  const index = placing - 1;
  if (index >= 0 && index < scoring.length) {
    return scoring[index];
  }
  return 0;
}

function getPlayerName(player: BCPPlayer): string {
  const firstName = player.user?.firstName || "";
  const lastName = player.user?.lastName || "";
  return `${firstName} ${lastName}`.trim();
}

function getFactionName(player: BCPPlayer): string {
  return player.faction?.name || "Unknown";
}

async function main(): Promise<void> {
  const scriptsDir = path.dirname(__filename);
  const tournamentsPath = path.join(scriptsDir, "tournaments-2026.json");
  const resultsPath = path.join(scriptsDir, "results-2026.json");

  // Read tournaments config
  const tournamentsConfig: TournamentsConfig = JSON.parse(
    fs.readFileSync(tournamentsPath, "utf-8")
  );

  const { tournaments, scoring } = tournamentsConfig;

  // Map to aggregate player scores: playerName -> PlayerResult
  const playerMap = new Map<string, PlayerResult>();

  // Process each tournament
  for (const tournament of tournaments) {
    console.log(`Fetching results for: ${tournament.name}`);

    try {
      const players = await fetchTournamentPlayers(tournament.bcp_id);

      for (const player of players) {
        const placing = player.placing;
        if (placing === undefined || placing === null) {
          continue;
        }

        const playerName = getPlayerName(player);
        if (!playerName) {
          continue;
        }

        const score = calculateScore(placing, scoring);
        const faction = getFactionName(player);

        const tournamentResult: PlayerTournamentResult = {
          name: tournament.name,
          rank: placing,
          score,
          faction,
        };

        if (playerMap.has(playerName)) {
          const existingPlayer = playerMap.get(playerName)!;
          existingPlayer.total_score += score;
          existingPlayer.tournaments.push(tournamentResult);
        } else {
          playerMap.set(playerName, {
            name: playerName,
            total_score: score,
            tournaments: [tournamentResult],
          });
        }
      }

      console.log(`  Found ${players.length} players`);
    } catch (error) {
      console.error(`  Error fetching ${tournament.name}:`, error);
    }
  }

  // Convert map to array and sort by total_score descending
  const playersArray = Array.from(playerMap.values()).sort(
    (a, b) => b.total_score - a.total_score
  );

  const results: ResultsOutput = {
    players: playersArray,
  };

  // Write results to file
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 4));

  console.log(`\nResults written to ${resultsPath}`);
  console.log(`Total players: ${playersArray.length}`);

  // Print top 10 players
  console.log("\nTop 10 players:");
  playersArray.slice(0, 10).forEach((player, index) => {
    console.log(`  ${index + 1}. ${player.name}: ${player.total_score} points`);
  });
}

main().catch(console.error);
