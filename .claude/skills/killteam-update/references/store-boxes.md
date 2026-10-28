# Warhammer Store boxes (`store_boxes`)

The list of products that a player buys in the Warhammer Store to play the team. Each item has these fields:

| Field | Value |
|---|---|
| `name` | Product name as the product page shows it (the `h1`), for example "Kill Team: Battleclade". Do not translate it. Remove the language suffix, for example "Kill Team: Starter Set (English)" becomes "Kill Team: Starter Set". |
| `url` | Product page URL without query parameters, for example `https://www.warhammer.com/en-WW/shop/kill-team-battleclade-2025`. Use the `en-WW` locale. |
| `contrastphase_url` | Optional. The same product in the ContrastPhase webstore, for example `https://contrastphase.hu/Kill-Team-Battleclade`. See "Other webstores". |
| `epicarium_url` | Optional. The same product in the Epicarium webstore, for example `https://epicarium.eu/products/kill-team-battleclade`. See "Other webstores". |

Example (`.en.md` only):

```yaml
store_boxes:
  - name: "Kill Team: Battleclade"
    url: https://www.warhammer.com/en-WW/shop/kill-team-battleclade-2025
    contrastphase_url: https://contrastphase.hu/Kill-Team-Battleclade
    epicarium_url: https://epicarium.eu/products/kill-team-battleclade
```

Write the fields in this order: `name`, `url`, `contrastphase_url`, `epicarium_url`.

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

## Other webstores (`contrastphase_url`, `epicarium_url`)

Find the same product as the `name` of the item in each store. Do this after `name` and `url` are known. Use the Playwright CLI session from SKILL.md. These stores do not have a WAF: do not wait 10 seconds between requests.

If a store does not sell the product, or you are not sure that the result is the same product, do not write the field. Tell the user. Do not guess URLs.

The same rules as for the Warhammer Store apply: no datacards, paints, bundles or other language versions of a different product.

### ContrastPhase (https://contrastphase.hu/)

Open the search page with the product name without the "Kill Team:" prefix (for example "Battleclade", "Starter Set", "Traitor Enforcer"). If the search finds exactly one product, the store redirects to the product page. Else it shows a result list.

```bash
playwright-cli -s=killteam goto "https://contrastphase.hu/shop_search.php?search=<product name>"
playwright-cli -s=killteam --raw eval "() => location.href + ' :: ' + document.querySelector('h1')?.innerText"
```

- If the URL is a product page (not `shop_search.php`), make sure that the `h1` is the product name (the store writes it in uppercase).
- If the URL is still `shop_search.php`, list the result links and select the correct product:

```bash
playwright-cli -s=killteam --raw eval "() => [...new Set([...document.querySelectorAll('a')]
  .filter(a => a.innerText.trim() && a.closest('[class*=product]'))
  .map(a => a.innerText.trim() + ' | ' + a.href))].slice(0, 15).join('\n')"
```

Write the product URL without query parameters and without `#`, for example `https://contrastphase.hu/Kill-Team-Starter-Set`.

### Epicarium (https://epicarium.eu/)

Open the product list with the search query. The product links start with `/products/`. Their `aria-label` is "<product name> megtekintése".

```bash
playwright-cli -s=killteam goto "https://epicarium.eu/products?q=<product name>"
playwright-cli -s=killteam --raw eval "async () => {
  await new Promise(r => setTimeout(r, 2000));
  return [...new Set([...document.querySelectorAll('a[href^=\"/products/\"]')]
    .map(a => (a.getAttribute('aria-label') || a.innerText).trim() + ' | ' + a.href))].slice(0, 12).join('\n');
}"
```

- The other `/products?...` links on the page are filters. Do not use them.
- Select the result with the same name as the product. Epicarium can add a language suffix ("(English)", `-english`, `-eng`) or write the name in uppercase. These are the same product.
- Do not select `kt-datacards-...` or `kill-team-datacards-...` results.

Write the product URL, for example `https://epicarium.eu/products/kill-team-starter-set-english`.

### Old Kill Team boxes (teams with `box_type` `wh40k` or `discontinued`)

ContrastPhase and Epicarium can still sell a Kill Team box that the Warhammer Store does not sell. Search both stores with the team name. If a store has the Kill Team box of the team, and the product page shows that it can be ordered, add it as the first item of `store_boxes`, without `url`:

```yaml
store_boxes:
  - name: "Kill Team: Exaction Squad"
    contrastphase_url: https://contrastphase.hu/Kill-Team-Exaction-Squad
  - name: "Exaction Squad"
    url: https://www.warhammer.com/en-WW/shop/imperial-agents-exaction-squad-2026
```

Do not add a box that cannot be ordered: ContrastPhase shows "Nem rendelhető", Epicarium shows that it is not in stock and cannot be ordered.

## Parallel work

Do all warhammer.com requests yourself (see "Parallel work" in SKILL.md). Subagents get the final `store_boxes` values and do not open warhammer.com.

You can also do the ContrastPhase and Epicarium searches yourself, because they are fast. If you give them to subagents, give each subagent its own Playwright CLI session name (for example `-s=killteam-<slug>`).
