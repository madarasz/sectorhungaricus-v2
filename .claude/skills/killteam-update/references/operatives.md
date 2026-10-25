# Operative numbers

## Source

The team rules PDF, the "Operatives" card with the heading "<TEAM> » KILL TEAM SELECTION". Find it with:

```bash
pdftotext -layout team.pdf - | grep -n -A40 "KILL TEAM SELECTION"
```

Read the footnotes under the lists too. They often change the count.

## Fields

- Fixed size: write `operatives: N` and remove `operatives_min` and `operatives_max`.
- Variable size: write `operatives_min` and `operatives_max`, and remove `operatives`.
- Remove empty lines such as `operatives: null`.
- Put the fields before `boxes:`, as in the other files.
- Write the values only to the `.en.md` file. The `.hu.md` file does not have them.

## How to count

Add the numbers of all "↘ N ... operative(s)" lines. Then check the rules that change the count:
- **"counts as two (three) selections"**: one operative uses more than one place. The minimum count comes from the most expensive options, and the maximum count from the cheapest options (often TROOPER, which you can select more than once).
- **"2 X operatives (still counts as one selection)"**: one place gives two operatives. This increases the maximum.
- **"instead of selecting one of these operatives, you can select a ploy"**: places can be empty. This decreases the minimum.
- **"only include each operative on this list once" / "up to one ..."**: limits the combinations. Check that the minimum and the maximum are possible.

## Examples (checked in October 2026)

- **Battleclade:** 1 Technoarcheologist + 1 Servitor Underseer + 8 servitors = **10** (fixed).
- **Blades of Khaine:** 1 Exarch + 7 warriors = **8** (fixed).
- **Blooded:** 1 Chieftain + 9 + 4 selections. The Enforcer and the Ogryn count as two selections each, and the Trooper as one. Minimum 1 + 9 + 2 = **12**, maximum 1 + 9 + 4 = **14**.
- **Brood Brothers:** 1 Commander + 9 + 3 selections. The Patriarch counts as three selections. 2 Psychic Familiars count as one selection. Each selection can be a free ploy instead. Minimum 1 + 9 + 0 = **10**, maximum 1 + 9 + (2 familiars + 2 troopers) = **14**.

In your report, show the calculation for each team.
