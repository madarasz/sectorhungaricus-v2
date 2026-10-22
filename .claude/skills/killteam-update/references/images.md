# Images (`image` and `second_image`)

Source: the team's product page in the warhammer.com webshop. Each product page has a gallery of photos. Use the photos that show **2x2 smaller photos** in one picture (close-ups of the models). In some of them, two of the four tiles are merged into one wide or tall tile. That is also correct.

Do not use these photos: the group photo of all models, scene photos (models on a table), token sheets, transfer sheets, sprues, the box.

- `image`: the best 2x2 photo. Prefer a clean 2x2 grid (four equal tiles) over a grid with merged tiles.
- `second_image`: a second, different 2x2 photo of the same product. If the product has only one such photo, do not write a `second_image` field. Tell the user.

The site shows `image` on the team card, and both images next to each other in the team details. The crop of the white border around the shop photos is done in the UI (`TeamImage.tsx`). Do not change the CSS for new photos.

## Finding the product page

Open the team list in the built-in browser: https://www.warhammer.com/en-WW/shop/other-games/kill-team/choose-a-kill-team , then run:

```js
await new Promise(r => setTimeout(r, 3000));
[...new Set([...document.querySelectorAll('a[href*="/shop/kill-team-"]')]
  .map(a => a.href.split('?')[0] + ' | ' + a.textContent.trim()))].join('\n')
```

Product URLs look like `https://www.warhammer.com/en-WW/shop/kill-team-<team>-<year>`. Ignore the datacard products (`kill-team-datacards-...`).

Some teams have no dedicated box (for example Angels of Death). Use the product that contains the team, for example the Kill Team Starter Set (`kill-team-starter-set-2024-eng`). Look at the gallery and use only photos of this team. If you cannot find a product with the team, do not change the image fields. Tell the user.

## Listing the gallery photos

On the warhammer.com origin in the built-in browser, `fetch()` the product page and read the image URLs from the HTML:

```js
const r = await fetch('/en-WW/shop/kill-team-battleclade-2025');
const t = await r.text();
[...new Set(t.match(/catalog\/product\/920x950\/[^"?\\ ]+/g) || [])].join('\n')
```

The list also contains photos of other products (paints, related teams). The gallery photos of the product come first and have the same product code prefix (for example `99120116048_`). Use only these.

## Looking at the photos

curl can download the image files (but not the product pages). Download small versions into a new empty folder in the scratchpad, and make one contact sheet with ImageMagick:

```bash
B=https://www.warhammer.com/app/resources/catalog/product/920x950
mkdir -p <scratchpad>/img-<slug>
for n in <file names without .jpg>; do
  curl -s -A "Mozilla/5.0" -o <scratchpad>/img-<slug>/$n.jpg "$B/$n.jpg?fm=jpg&w=300&h=310"
done
montage <scratchpad>/img-<slug>/*.jpg -geometry 200x206+4+4 -tile 6x <scratchpad>/img-<slug>-sheet.jpg
```

`montage` cannot write labels (no Freetype), and it sorts the files by name. Before you write a file name to a team file, open that single image file with Read and make sure that it is the 2x2 photo. Do not count tiles on the contact sheet to find the file name.

## URL format

Write the full URL with these parameters (the image is about 1:1, 891×920):

```
image: https://www.warhammer.com/app/resources/catalog/product/920x950/99120116048_KillTeamBattlecladeSquad20252.jpg?fm=webp&w=892&h=920
second_image: https://www.warhammer.com/app/resources/catalog/product/920x950/99120116048_KillTeamBattlecladeSquad20253.jpg?fm=webp&w=892&h=920
```

- Put `second_image` on the line after `image`.
- Both fields are `i18n: "duplicate"`: write the same values to the `.en.md` and the `.hu.md` file.
