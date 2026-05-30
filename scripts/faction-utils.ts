import * as fs from "fs";
import * as path from "path";

interface BCPPlayerForFaction {
  placing?: number;
  faction?: {
    name?: string;
  };
  user?: {
    firstName?: string;
    lastName?: string;
  };
}

interface BCPPlayersResponse {
  active?: BCPPlayerForFaction[];
}

// Per-tournament cache: bcp_id -> playerName -> faction
const playerFactionCache = new Map<string, Map<string, string>>();

async function fetchPlayerFactions(
  bcpId: string,
  cacheDir: string
): Promise<Map<string, string>> {
  const cachePath = path.join(cacheDir, `${bcpId}_factions.json`);

  if (fs.existsSync(cachePath)) {
    const raw: Record<string, string> = JSON.parse(
      fs.readFileSync(cachePath, "utf-8")
    );
    return new Map(Object.entries(raw));
  }

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
      `Failed to fetch players for ${bcpId}: ${response.status} ${response.statusText}`
    );
  }

  const data: BCPPlayersResponse = await response.json();
  const players = data.active || [];

  const map = new Map<string, string>();
  for (const player of players) {
    const firstName = player.user?.firstName || "";
    const lastName = player.user?.lastName || "";
    const name = `${firstName} ${lastName}`.trim();
    const faction = player.faction?.name;
    if (name && faction) {
      map.set(name, faction);
    }
  }

  const record: Record<string, string> = Object.fromEntries(map);
  fs.writeFileSync(cachePath, JSON.stringify(record, null, 4));

  return map;
}

export async function loadFactionCache(
  bcpId: string,
  cacheDir: string
): Promise<void> {
  if (playerFactionCache.has(bcpId)) return;
  const map = await fetchPlayerFactions(bcpId, cacheDir);
  playerFactionCache.set(bcpId, map);
}

/**
 * Resolve faction for a player in a given tournament.
 * First tries the inline pairings faction string; falls back to the players API cache.
 */
export function getFactionName(
  pairingFaction: string | undefined,
  playerName: string,
  bcpId: string
): string {
  if (pairingFaction && pairingFaction !== "Unknown") {
    return pairingFaction;
  }
  const tournamentFactions = playerFactionCache.get(bcpId);
  if (tournamentFactions) {
    const faction = tournamentFactions.get(playerName);
    if (faction) return faction;
  }
  return "Unknown";
}

// Workaround for missing/wrong factions in BCP
export function sanitizeFactionName(
  faction: string,
  tournamentName: string
): string {
  if (
    faction === "Legionary" &&
    tournamentName === "Contrast Clash - January 2026"
  ) {
    return "Murderwing";
  }
  return faction;
}
