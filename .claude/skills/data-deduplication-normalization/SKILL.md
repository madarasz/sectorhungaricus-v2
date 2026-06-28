---
name: data-deduplication-normalization
description: Use when user asks to fix duplicate player names, deduplicate names, or update sanitizePlayerName() in scripts/get_tournament_points.ts. Triggered by: same player appearing twice in `npm run points` output with different BCP spellings (missing accents, third name, surname-first, double space).
---

# Player Name Deduplication (sector-hungaricus-v2)

## Workflow

1. Run `npm run points` — look at "All players:" output
2. Identify candidate duplicates: pairs of entries that look like the same person with different name spellings
3. Present candidates to the user — **do not edit code yet**
4. User confirms which pairs are the same person
5. For each confirmed pair, find the raw BCP form: `grep -r "NameVariant" scripts/cache/pairings/`
6. Add rule(s) to `sanitizePlayerName()` in `scripts/get_tournament_points.ts`
7. Re-run `npm run points` — verify unified entry's tournament count equals the sum of the two split entries

## Core Rule

Every rule must collapse two separate entries into one. There are no cosmetic renames — if a name appears only once in the output, there is nothing to fix.

Real dedup signal: `4 tournaments + 1 tournament → 5 tournaments (unified)`.

**Never edit `sanitizePlayerName()` without user confirmation of the pair.**

## sanitizePlayerName() Location

`scripts/get_tournament_points.ts:152`

Maps FROM BCP raw name → TO canonical display name. BCP is the source of truth for raw names; cache files under `scripts/cache/pairings/` contain them verbatim.

## Known BCP Name Quirks

- **Third/middle name**: `"Vince Balázs Soós"` → `"Vince Soós"`
- **Trailing space in firstName**: produces `"Vince  Soós"` (double space in output) → `"Vince Soós"`
- **ALL CAPS**: `"SANDOR TAMAS BALOGH"` → `"Sándor Tamás Balogh"`
- **Surname-first**: `"Szarvas Dominik"` → `"Dominik Szarvas"`
- **No accents**: `"Marton Mati"` → `"Márton Mati"`, `"Gabor Kiss"` → `"Gábor Kiss"`
- **First/last swapped with accents**: `"Bence Gombás"` → `"Gombás Bence"`

## What NOT to Do

- Do not edit `sanitizePlayerName()` before user confirms the pair
- Do not add rules for names that appear only once — no dedup needed
- Do not correct spelling/accents/ordering without a matching duplicate entry to collapse into
