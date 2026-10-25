# Tournament legal until (`legal_until`)

## Source

The "Approved Ops Tournament Companion" PDF from the "Key downloads" part of https://www.warhammer-community.com/en-gb/downloads/kill-team/. Get the current link from the page (see SKILL.md). The file name contains the year (for example `eng_kt_approved_ops_2025_tournament_companion-....pdf`), and a newer companion can replace it.

## Read the Classified Rotation as images

The "CLASSIFIED ROTATION" section is a chart: a season icon on the left, a bracket, and a grid of team icons with names. With `pdftotext` the team names of different seasons mix together, so do not trust the text output. Render the pages and look at them:

```bash
# find the pages
for p in $(seq 1 $(pdfinfo companion.pdf | awk '/Pages/{print $2}')); do
  pdftotext -f $p -l $p companion.pdf - | grep -qi "classified rotation" && echo $p; done
# render them
pdftoppm -f <first> -l <last> -r 70 -png companion.pdf page
```

Then read each PNG. A team belongs to the season whose bracket is next to it. In the 2025 companion the rotation is on pages 3–4.

## Season → year

| Season | `legal_until` |
|---|---|
| Gallowdark | 2026 |
| Bheta-Decima | 2027 |
| Volkus | 2028 |
| Tomb World | 2029 |
| Armageddon (name not verified yet) | 2030 |

The user gave these values. If the PDF shows a season that is not in this table, do not guess a year. Ask the user.

## Teams not on the list

If a team is not in the Classified Rotation, it is not tournament legal (non-classified). Then remove the `legal_until` line from the `.en.md` file. Do not write `0`, `null`, `""` or a past year, and do not invent a year. (`src/lib/markdown.ts` turns any non-number into `undefined`, and `getLegality()` shows `undefined` as "declassified". The CMS hint also says: "Empty means not tournament legal".) Tell the user which teams are not on the list, because a missing team can also be a name mismatch (for example "XV26 Stealth Battlesuits" in the PDF and "xv26-stealth-battlesuits" as the file slug).

Write the value only to the `.en.md` file. The `.hu.md` file does not have it.
