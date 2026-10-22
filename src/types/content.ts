export interface ImageVariants {
  original?: string
  thumb?: string
  mobile?: string
  desktop?: string
}

export interface GameContent {
  slug: string
  data: {
    title: string
    description: string
    order: number
    featuredImage?: string
    featuredImageVariants?: ImageVariants
    gallery?: string
  }
  contentHtml: string
}

export interface TournamentContent {
  slug: string
  data: {
    title: string
    date: string
    game: string
    url: string
  }
  contentHtml: string
}

export interface GalleryContent {
  slug: string
  data: {
    title: string
    description?: string
    images?: Array<{
      src: string
      variants?: ImageVariants
      caption?: string
      alt: string
    }>
  }
  contentHtml: string
}

export interface PageContent {
  slug: string
  data: {
    title: string
    hero?: string
    metaTitle?: string
    metaDescription?: string
  }
  contentHtml: string
}

export interface ArtistContent {
  slug: string
  data: {
    name: string
    portfolio?: string
    does_commission: boolean
    gallery: string
  }
  contentHtml: string
}

export interface ContentBlock {
  type: 'text_block' | 'hero_block' | 'two_column_block' | 'gallery_block' | 'page_reference_block' | 'artist_block' | 'kill_team_chooser'
  content?: string
  style?: 'normal' | 'bordered'
  block_title?: string
  hide_title?: boolean
  left_content?: string
  right_content?: string
  gallery?: string
  galleryData?: {
    title: string
    description?: string
    images?: Array<{
      src: string
      variants?: ImageVariants
      caption?: string
      alt: string
    }>
  }
  page_reference?: string
  artist?: string
  artistData?: {
    name: string
    portfolio?: string
    does_commission: boolean
    gallery: string
    galleryData?: {
      title: string
      description?: string
      images?: Array<{
        src: string
        variants?: ImageVariants
        caption?: string
        alt: string
      }>
    }
  }
  labels?: KillTeamChooserLabels
  killTeams?: KillTeam[]
}

export type KillTeamCombat = 'ranged' | 'melee'
export type KillTeamTier = 'S' | 'A' | 'B' | 'C' | 'D' | 'E'

export interface KillTeam {
  slug: string
  name: string
  factions: string[]
  operatives?: number
  operatives_min?: number
  operatives_max?: number
  boxes: number
  boxes_note?: string
  tier?: KillTeamTier
  reviewed: boolean
  beginner_friendly: boolean
  combat: KillTeamCombat[]
  legal_until?: number
  image?: string
  imageVariants?: ImageVariants
  playstyleHtml: string
}

export interface KillTeamFactionOption {
  value: string
  label: string
  in_filter: boolean
}

export interface KillTeamChooserLabels {
  q_experience: string
  a_experience_new: string
  a_experience_played: string
  q_fight: string
  a_fight_ranged: string
  a_fight_melee: string
  a_fight_mixed: string
  q_size: string
  a_size_few: string
  a_size_many: string
  a_size_horde: string
  q_boxes: string
  a_boxes_one: string
  a_boxes_more: string
  q_legal: string
  a_legal_classified: string
  q_faction: string
  factions: KillTeamFactionOption[]
  result_count: string
  reset: string
  empty_state: string
  declassified_separator: string
  under_construction: string
  beginner_tag: string
  operatives_label: string
  boxes_label: string
  combat_label: string
  ranged_label: string
  melee_label: string
  tier_label: string
  legal_until_label: string
  rotates_soon_label: string
  not_legal_label: string
  close_label: string
}

export interface SubpageContent {
  slug: string
  data: {
    title: string
    'hide-title': boolean
    slug: string
    order: number
    game: string
    metaTitle?: string
    metaDescription?: string
    content_blocks: ContentBlock[]
  }
  contentHtml: string
}