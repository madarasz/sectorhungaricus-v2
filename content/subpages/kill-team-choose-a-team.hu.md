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
      a_size_horde: Egy egész hordát
      q_boxes: Hány dobozt vennél?
      a_boxes_one: Csak egyet
      a_boxes_more: Kettő vagy több is jó
      q_legal: Versenylegális?
      a_legal_classified: Igen, classified
      a_legal_declassified: Nem, non-classified
      q_faction: Melyik oldalon harcolnál?
      factions:
        - {value: imperium, label: Imperium, in_filter: true}
        - {value: chaos, label: Káosz, in_filter: true}
        - {value: xenos, label: Xenos, in_filter: true}
        - {value: aeldari, label: Aeldari, in_filter: true}
        - {value: orks, label: Orkok, in_filter: true}
        - {value: tyranids, label: Tyranidák, in_filter: false}
        - {value: space-marine, label: Űrgárdisták, in_filter: false}
        - {value: astra-militarum, label: Astra Militarum, in_filter: false}
        - {value: tau, label: T'au Birodalom, in_filter: false}
        - {value: votann, label: Leagues of Votann, in_filter: false}
        - {value: necrons, label: Necronok, in_filter: false}
        - {value: adepta-sororitas, label: Adepta Sororitas, in_filter: false}
        - {value: adeptus-mechanicus, label: Adeptus Mechanicus, in_filter: false}
        - {value: genestealer-cults, label: Genestealer kultuszok, in_filter: false}
        - {value: drukhari, label: Drukhari, in_filter: false}
      reviewed_filter: Csak az ellenőrzött csapatok
      result_count: "{shown} / {total} csapat"
      reset: Válaszok törlése
      empty_state: Egyik csapat sem felel meg minden válasznak. Változtass meg egy választ, hogy több csapatot láss.
      beginner_tag: Kezdőbarát
      operatives_label: Operatívok
      boxes_label: Szükséges dobozok
      combat_label: Harcmodor
      ranged_label: Távolsági
      melee_label: Közelharci
      tier_label: Erősség
      legal_until_label: Versenylegális eddig
      rotates_soon_label: Ez a csapat hamarosan kikerül a versenyjátékból.
      not_legal_label: Nem versenylegális (non-classified)
      close_label: Csapat részleteinek bezárása
---
