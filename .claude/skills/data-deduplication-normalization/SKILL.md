---
name: data-deduplication-normalization
description: Use when user asks to fix duplicate players, deduplicate names, merge BCP accounts, fix a shown player name, or update ID_ALIASES / DISPLAY_NAMES in scripts/get_tournament_points.ts. Triggered by: same person appearing twice in `npm run points` output (two BCP accounts), or a player name shown with missing accents, broken encoding, surname-first or other bad spelling.
---

# Player Deduplication (sector-hungaricus-v2)

`scripts/get_tournament_points.ts` identifies players by BCP user ID (`player.user.id` in the pairings), not by name. Name changes and different spellings of one BCP account do not make duplicates.

Two maps in the script:

- `ID_ALIASES`: old BCP user ID → kept BCP user ID. Use when one person has more than one BCP account. Merges ELO, record and tournaments.
- `DISPLAY_NAMES`: BCP user ID → shown name. Cosmetic only. Without an entry, the name from the player's most recent tournament is shown.

## Workflow: one person, two accounts

1. Run `npm run points`. The "All players (all-time)" output shows `Name [userId]`.
2. Find candidates: the same or similar names with different IDs.
3. Check the tournaments of each ID (pairings in `scripts/cache/pairings/<bcp_id>.json`, search for the ID). **Two IDs in the same tournament are two different people. Do not merge them** (example: the two "Dávid Nagy" accounts both played in Liga Season 4).
4. Present candidates to the user. **Do not edit code yet.**
5. After the user confirms, add `oldId: "keptId"` to `ID_ALIASES`. Keep the ID of the most recent account.
6. Run `npm run points` again. The merged entry's tournament count must equal the sum of the two split entries.

## Workflow: bad shown name

1. Find the player's ID in the `npm run points` output.
2. Add `id: "Correct Name"` to `DISPLAY_NAMES`. Use the kept ID, not an alias.

## Known BCP Name Quirks (DISPLAY_NAMES candidates)

- Third/middle name: `"Vince Balázs Soós"` → `"Vince Soós"`
- ALL CAPS: `"SANDOR TAMAS BALOGH"` → `"Sándor Tamás Balogh"`
- Surname-first: `"Szarvas Dominik"` → `"Dominik Szarvas"`
- No accents: `"Marton Mati"` → `"Márton Mati"`
- Broken encoding: `"LÃ³rÃ¡nd"` → `"Lóránd"`

## What NOT to Do

- Do not add to `ID_ALIASES` before the user confirms the pair.
- Do not merge IDs that played in the same tournament.
- Do not key players by name again.
