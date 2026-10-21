---
title: Choose a Kill Team
hide-title: false
slug: choose-a-team
order: 7
metaTitle: Choose your Kill Team — Sector Hungaricus
metaDescription: Not sure which Kill Team to start with? Answer a few questions about how you like to play and see which teams fit you.
game: kill-team
content_blocks:
  - type: text_block
    style: normal
    content: >-
      Let us help you find the best team for you.
  - type: kill_team_chooser
    labels:
      q_experience: Have you played Kill Team before?
      a_experience_new: No, this is my first team
      a_experience_played: "Yes"
      q_fight: Which kind of combat do you prefer?
      a_fight_ranged: From range
      a_fight_melee: Up close
      a_fight_mixed: Bit of both
      q_size: How many models do you want to paint?
      a_size_few: A few elite models
      a_size_many: Many models
      a_size_horde: A horde
      q_boxes: How many boxes will you buy?
      a_boxes_one: Only one box
      a_boxes_more: Two or more is fine
      q_legal: Legal on all tournaments
      a_legal_classified: Yes, classified
      q_faction: Which faction?
      factions:
        - {value: imperium, label: Imperium, in_filter: true}
        - {value: chaos, label: Chaos, in_filter: true}
        - {value: xenos, label: Xenos, in_filter: true}
        - {value: aeldari, label: Aeldari, in_filter: true}
        - {value: orks, label: Orks, in_filter: true}
        - {value: tyranids, label: Tyranids, in_filter: false}
        - {value: space-marine, label: Space Marines, in_filter: false}
        - {value: astra-militarum, label: Astra Militarum, in_filter: false}
        - {value: tau, label: T'au Empire, in_filter: false}
        - {value: votann, label: Leagues of Votann, in_filter: false}
        - {value: necrons, label: Necrons, in_filter: false}
        - {value: adepta-sororitas, label: Adepta Sororitas, in_filter: false}
        - {value: adeptus-mechanicus, label: Adeptus Mechanicus, in_filter: false}
        - {value: genestealer-cults, label: Genestealer Cults, in_filter: false}
        - {value: drukhari, label: Drukhari, in_filter: false}
      reviewed_filter: Show only reviewed teams
      result_count: "Showing {shown} of {total} teams"
      reset: Clear answers
      empty_state: No team fits every answer. Change one answer to see more teams.
      beginner_tag: Beginner-friendly
      operatives_label: Operatives
      boxes_label: Boxes to buy
      combat_label: Fighting style
      ranged_label: Ranged
      melee_label: Melee
      tier_label: Power level
      legal_until_label: Tournament legal until
      rotates_soon_label: This team rotates out of tournament play soon.
      not_legal_label: Not tournament legal (non-classified)
      close_label: Close team details
---
