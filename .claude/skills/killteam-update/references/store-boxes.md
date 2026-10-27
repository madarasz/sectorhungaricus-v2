# Warhammer Store boxes (`store_boxes`)

The list of products that a player buys in the Warhammer Store to play the team. Each item has two fields:

| Field | Value |
|---|---|
| `name` | Product name as the product page shows it (the `h1`), for example "Kill Team: Battleclade". Do not translate it. Remove the language suffix, for example "Kill Team: Starter Set (English)" becomes "Kill Team: Starter Set". |
| `url` | Product page URL without query parameters, for example `https://www.warhammer.com/en-WW/shop/kill-team-battleclade-2025`. Use the `en-WW` locale. |

Example (`.en.md` only):

```yaml
store_boxes:
  - name: "Kill Team: Battleclade"
    url: https://www.warhammer.com/en-WW/shop/kill-team-battleclade-2025
```

Put `store_boxes` on the line after `box_type`. The field is shared: write it only to the `.en.md` file. The `.hu.md` file does not have it.

## Which products

First read the `boxes_note` field of the team. It usually names the boxes to buy (for example "You need additional Howling Banshees and Dire Avengers WH40k boxes"). If `boxes_note` does not name them, read the explanation column of the Reddit wiki (https://www.reddit.com/r/killteam/wiki/one-box-teams/). Add one item for each box that these sources name, for all values of `box_type`:

- `kill-team`: the Kill Team box of the team (the same product page as in references/images.md), plus each additional kit that `boxes_note` or the Reddit wiki names. Teams without a dedicated box (for example Angels of Death) use the product that contains the team, for example the Kill Team Starter Set.
- `wh40k`: the Warhammer 40,000 kits that contain the models (for example "Harlequin Troupe, Death Jester and Shadowseer").
- `discontinued`: the Kill Team box is not available, but the kits that `boxes_note` or the Reddit wiki names can still be in the store (for example the Warhammer 40,000 kits that contain the models). Add each kit that has a valid product page. Do not add the discontinued Kill Team box or upgrade sprue.

If a named box has no valid product page, do not write it. Tell the user.

Do not add paints, tools, datacards (`kill-team-datacards-...`), terrain or bundles that also contain other products.

Write each product one time only. The number of boxes to buy is in the `boxes` field (references/boxes.md).

## Finding the product pages

Use the Playwright CLI session and the 10-second wait from "Web pages: Playwright CLI" in SKILL.md.

- **Kill Team boxes**: use the team list of references/images.md ("Finding the product page"). The link text there is not always the full product name.
- **Warhammer 40,000 kits**: open the store search page with the kit name, then list the product links. The results load slowly, so wait 10 seconds. The result links have a `queryID` parameter. The other `/shop/` links on the page are the menu.

```bash
sleep 10
playwright-cli -s=killteam goto "https://www.warhammer.com/en-WW/plp?search=<kit name>"
playwright-cli -s=killteam --raw eval "async () => {
  await new Promise(r => setTimeout(r, 10000));
  return [...new Set([...document.querySelectorAll('a[href*=\"queryID\"]')]
    .map(a => a.href.split('?')[0] + ' | ' + a.textContent.trim().slice(0, 60)))].slice(0, 6).join('\n');
}"
```

If the search does not find the kit, or the search page format changed, ask the user for the product URL. Do not guess URLs.

## Reading the product name

Open each product page and read the name. Run `sleep 10` before each request:

```bash
sleep 10
playwright-cli -s=killteam --raw eval "async () => {
  const t = await (await fetch('/en-WW/shop/kill-team-battleclade-2025')).text();
  const d = new DOMParser().parseFromString(t, 'text/html');
  return (d.querySelector('h1')?.textContent || d.title).trim();
}"
```

If the fetched HTML has no `h1`, `goto` the page and read `document.querySelector('h1').textContent`.

A product page that says "No longer available", or that redirects to a list page, is not a valid product. Do not write it. Tell the user, because `box_type` can be wrong.

When you update `image` and `second_image` too, use the same product page request for both fields. Do not open the page twice.

## Parallel work

Do all warhammer.com requests yourself (see "Parallel work" in SKILL.md). Subagents get the final `store_boxes` values and do not open warhammer.com.
