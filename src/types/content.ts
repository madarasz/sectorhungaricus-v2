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
  }
  contentHtml: string
}

export interface ContentBlock {
  type: 'text_block' | 'hero_block' | 'two_column_block' | 'gallery_block'
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
}

export interface SubpageContent {
  slug: string
  data: {
    title: string
    'hide-title': boolean
    slug: string
    order: number
    game: string
    content_blocks: ContentBlock[]
  }
  contentHtml: string
}