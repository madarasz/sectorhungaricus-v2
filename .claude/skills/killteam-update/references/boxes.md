# Boxes to buy (`boxes`), box type (`box_type`) and boxes note (`boxes_note`)

Both sources are on Reddit. Open them with the Playwright CLI (see "Web pages: Playwright CLI" in SKILL.md) and read the page text with `playwright-cli -s=killteam --raw eval "document.body.innerText"`. If Reddit shows a challenge page that the user cannot complete, ask the user to paste the table rows for the requested teams.

## `boxes`

Source: https://www.reddit.com/r/killteam/comments/1run1eg/number_of_boxes_per_team_super_guide/

- Use the "minimum amount of boxes" number for the team.
- The CMS allows 1–3 (`min: 1, max: 3` in `config.yml`). If the source says more than 3, or gives no number, do not write a value. Tell the user.
- Write the same value to the `.en.md` and the `.hu.md` file.

## `box_type`

Sources: the Reddit wiki explanation column (see `boxes_note`), and the team list of the warhammer.com webshop (https://www.warhammer.com/en-WW/shop/other-games/kill-team/choose-a-kill-team, see references/images.md).

| Value | Use it when |
|---|---|
| `kill-team` | The webshop sells a Kill Team box of the team. |
| `wh40k` | There is no Kill Team box (discontinued, or there never was one), but you can buy the models in Warhammer 40,000 boxes. |
| `discontinued` | You cannot buy the models anymore. |

- The site shows a fixed note for `wh40k` and `discontinued` (`wh40k_note` and `discontinued_note` in `content/subpages/kill-team-choose-a-team.*.md`). For `wh40k` the note says that the team is not sold as a Kill Team box, that the models are in Warhammer 40,000 boxes, and that these boxes do not contain the Kill Team tokens.
- Write the same value to the `.en.md` and the `.hu.md` file.

## `boxes_note`

Source: https://www.reddit.com/r/killteam/wiki/one-box-teams/ , the explanation column of the team's row.

- Two sentences maximum. Summarize in your own words, do not copy.
- Keep only information that helps a buyer: what is missing from one box, which options need a second box, what you can magnetize or proxy, where else the models come from.
- Do not repeat what `box_type` shows. Do not write that the Kill Team box is discontinued, that there never was a Kill Team box, that the models are sold in the Warhammer 40,000 range, or that the 40k boxes have no team tokens. Set `box_type` to the correct value instead. Bad: "The Kill Team box is discontinued, but the same kit is sold in the WH40k range without the team tokens." You can still name the specific 40k kits that the buyer needs (for example "Harlequin Troupe, Death Jester and Shadowseer").
- If the team is a clean one-box team and there is nothing useful to say, the note can be empty. Do not write a filler sentence.
- `boxes_note` is translated: write an English text in `.en.md` and a Hungarian text in `.hu.md`. The Hungarian language rules of SKILL.md apply.
- Long notes wrap in YAML. Keep the frontmatter valid (plain scalar on more lines with two-space indentation, as in the existing files, or quote the text).
