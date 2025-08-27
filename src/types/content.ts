export interface GameContent {
  slug: string
  data: {
    title: string
    description: string
    featuredImage?: string
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