---
title: Válassz Kill Teamet
hide-title: false
slug: choose-a-team
order: 7
metaTitle: Válaszd ki a Kill Teamed — Sector Hungaricus
metaDescription: Nem tudod, melyik Kill Teammel kezdj? Válaszolj néhány kérdésre a játékstílusodról, és megmutatjuk, melyik csapat illik hozzád.
game: kill-team
content_blocks:
  - type: text_block
    style: normal
    content: >-
      Válaszolj az alábbi kérdésekre. A lista csak azokat a csapatokat mutatja, amelyek illenek a válaszaidhoz. Válassz ki egy csapatot, és megnézheted, hogyan játszik, mennyire erős most, és meddig versenylegális.
  - type: kill_team_chooser
    labels:
      elite_max_operatives: 7
      q_experience: Játszottál már Kill Teamet?
      a_experience_new: Nem, ez az első csapatom
      a_experience_played: Igen
      q_fight: Hogyan szeretsz harcolni?
      a_fight_ranged: Távolról
      a_fight_melee: Közelharcban
      a_fight_mixed: Mindkettő
      q_size: Hány figurát szeretnél festeni?
      a_size_few: Néhány elit figurát
      a_size_many: Sok figurát
      q_boxes: Hány dobozt vennél?
      a_boxes_one: Csak egyet
      a_boxes_more: Kettő vagy több is jó
      q_faction: Melyik oldalon harcolnál?
      factions:
        - {value: imperium, label: Imperium}
        - {value: chaos, label: Káosz}
        - {value: xenos, label: Xenos}
        - {value: aeldari, label: Aeldari}
        - {value: orks, label: Orkok}
        - {value: tyranids, label: Tyranidák}
        - {value: space-marine, label: Űrgárdisták}
        - {value: astra-militarum, label: Astra Militarum}
        - {value: tau, label: T'au Birodalom}
        - {value: votann, label: Leagues of Votann}
      result_count: "{shown} / {total} csapat"
      reset: Válaszok törlése
      empty_state: Egyik csapat sem felel meg minden válasznak. Változtass meg egy választ, hogy több csapatot láss.
      beginner_tag: Kezdőbarát
      operatives_label: Operatívok
      boxes_label: Megveendő dobozok
      combat_label: Harcmodor
      ranged_label: Távolsági
      melee_label: Közelharci
      tier_label: Erősség
      legal_until_label: Versenylegális eddig
      rotates_soon_label: Ez a csapat hamarosan kikerül a versenyjátékból.
      close_label: Csapat részleteinek bezárása
---
