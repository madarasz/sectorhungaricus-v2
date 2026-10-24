# Boxes to buy (`boxes`) and boxes note (`boxes_note`)

Both sources are on Reddit. WebFetch, curl and the built-in browser cannot open reddit.com. Use Claude in Chrome (the user's Chrome) and read the page text. If Claude in Chrome is not available, ask the user to paste the table rows for the requested teams.

## `boxes`

Source: https://www.reddit.com/r/killteam/comments/1run1eg/number_of_boxes_per_team_super_guide/

- Use the "minimum amount of boxes" number for the team.
- The CMS allows 1–3 (`min: 1, max: 3` in `config.yml`). If the source says more than 3, or gives no number, do not write a value. Tell the user.
- Write the same value to the `.en.md` and the `.hu.md` file.

## `boxes_note`

Source: https://www.reddit.com/r/killteam/wiki/one-box-teams/ , the explanation column of the team's row.

- Two sentences maximum. Summarize in your own words, do not copy.
- Keep only information that helps a buyer: what is missing from one box, which options need a second box, what you can magnetize or proxy, where else the models come from.
- If the team is a clean one-box team and there is nothing useful to say, the note can be empty. Do not write a filler sentence.
- `boxes_note` is translated: write an English text in `.en.md` and a Hungarian text in `.hu.md`. The Hungarian language rules of SKILL.md apply.
- Long notes wrap in YAML. Keep the frontmatter valid (plain scalar on more lines with two-space indentation, as in the existing files, or quote the text).
