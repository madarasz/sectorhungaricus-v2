import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import { ContentBlock, KillTeam, KillTeamStoreBox } from '@/types/content'
import { generateImageVariants } from './imageVariants'
import { STORE_BOX_ATTRIBUTE } from './storeBoxes'

const contentDirectory = path.join(process.cwd(), 'content')

async function processMarkdownString(content: string): Promise<string> {
  // Check if content is already HTML (contains HTML tags)
  if (content.includes('<') && content.includes('>')) {
    return content
  }
  
  const processedContent = await remark()
    .use(html)
    .process(content)
  return processedContent.toString()
}

// "{store-box-slug}" in CMS text shows the store box with its store links (see RichText)
const STORE_BOX_TOKEN = /\{([a-z0-9]+(?:-[a-z0-9]+)*)\}/g

function insertStoreBoxes(html: string, storeBoxes: Map<string, KillTeamStoreBox>, used: Record<string, KillTeamStoreBox>): string {
  return html.replace(STORE_BOX_TOKEN, (_, slug: string) => {
    const box = storeBoxes.get(slug)
    if (!box) throw new Error(`Content refers to unknown store box "{${slug}}"`)
    used[slug] = box
    return `<span ${STORE_BOX_ATTRIBUTE}="${slug}"></span>`
  })
}

async function processContentBlocks(blocks: ContentBlock[], locale?: string): Promise<ContentBlock[]> {
  const processedBlocks = []
  const storeBoxes = await getStoreBoxes()
  
  for (const block of blocks) {
    const processedBlock = { ...block }
    const usedStoreBoxes: Record<string, KillTeamStoreBox> = {}
    
    if (block.content) {
      processedBlock.content = insertStoreBoxes(await processMarkdownString(block.content), storeBoxes, usedStoreBoxes)
    }
    if (block.left_content) {
      processedBlock.left_content = insertStoreBoxes(await processMarkdownString(block.left_content), storeBoxes, usedStoreBoxes)
    }
    if (block.right_content) {
      processedBlock.right_content = insertStoreBoxes(await processMarkdownString(block.right_content), storeBoxes, usedStoreBoxes)
    }
    if (Object.keys(usedStoreBoxes).length) {
      processedBlock.storeBoxes = usedStoreBoxes
    }
    
    // Load gallery data for gallery blocks
    if (block.type === 'gallery_block' && block.gallery) {
      const galleryData = await getMarkdownContent('galleries', block.gallery)
      if (galleryData) {
        processedBlock.galleryData = galleryData.data as {
          title: string
          description?: string
          images?: Array<{
            src: string
            variants?: import('@/types/content').ImageVariants
            caption?: string
            alt: string
          }>
        }
        // Generate image variants for gallery images
        if (processedBlock.galleryData.images) {
          processedBlock.galleryData.images = processedBlock.galleryData.images.map(image => ({
            ...image,
            variants: generateImageVariants(image.src)
          }))
        }
      }
    }

    // Load artist data for artist blocks
    if (block.type === 'artist_block' && block.artist) {
      const artistData = await getMarkdownContent('artists', block.artist)
      if (artistData) {
        const artistInfo = artistData.data as {
          name: string
          portfolio?: string
          does_commission: boolean
          gallery: string
        }

        // Load the artist's gallery
        const galleryData = await getMarkdownContent('galleries', artistInfo.gallery)
        let galleryDataResolved: {
          title: string
          description?: string
          images?: Array<{
            src: string
            variants?: import('@/types/content').ImageVariants
            caption?: string
            alt: string
          }>
        } | undefined

        if (galleryData) {
          galleryDataResolved = galleryData.data as typeof galleryDataResolved
          // Generate image variants for gallery images
          if (galleryDataResolved?.images) {
            galleryDataResolved.images = galleryDataResolved.images.map(image => ({
              ...image,
              variants: generateImageVariants(image.src)
            }))
          }
        }

        processedBlock.artistData = {
          ...artistInfo,
          galleryData: galleryDataResolved
        }
      }
    }

    // Load all kill teams for the team chooser block
    if (block.type === 'kill_team_chooser') {
      // Only reviewed teams are shown
      processedBlock.killTeams = (await getKillTeams(locale)).filter((team) => team.reviewed)
    }

    processedBlocks.push(processedBlock)
  }
  
  return processedBlocks
}

export async function getMarkdownContent(collection: string, slug: string, locale?: string): Promise<{
  slug: string;
  data: Record<string, unknown>;
  contentHtml: string;
} | null> {
  const fileName = locale ? `${slug}.${locale}.md` : `${slug}.md`
  const fullPath = path.join(contentDirectory, collection, fileName)
  
  if (!fs.existsSync(fullPath)) {
    return null
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  
  const processedContent = await remark()
    .use(html)
    .process(content)
  const contentHtml = processedContent.toString()

  // Process content blocks for subpages
  if (collection === 'subpages' && data.content_blocks) {
    data.content_blocks = await processContentBlocks(data.content_blocks as ContentBlock[], locale)
  }

  // Generate image variants for featured images in games
  if (collection === 'games' && data.featuredImage) {
    data.featuredImageVariants = generateImageVariants(data.featuredImage as string)
  }

  // Generate image variants for gallery images
  if (collection === 'galleries' && data.images) {
    data.images = (data.images as Array<{ src: string; caption?: string; alt: string }>).map((image) => ({
      ...image,
      variants: generateImageVariants(image.src)
    }))
  }

  // Ensure content_blocks are properly structured for serialization
  const result = {
    slug,
    data: {
      ...data,
      content_blocks: data.content_blocks ? JSON.parse(JSON.stringify(data.content_blocks)) : undefined
    },
    contentHtml,
  }
  
  return result
}

export function getAllSlugs(collection: string) {
  const collectionPath = path.join(contentDirectory, collection)
  
  if (!fs.existsSync(collectionPath)) {
    return []
  }
  
  const filenames = fs.readdirSync(collectionPath)
  
  // Extract unique slugs (remove .locale.md extensions)
  const slugs = Array.from(new Set(
    filenames
      .filter(name => name.endsWith('.md'))
      .map(name => {
        // Remove .en.md or .hu.md or just .md
        return name.replace(/\.(en|hu)\.md$/, '').replace(/\.md$/, '')
      })
  ))
  
  return slugs
}

export function getAllContent(collection: string, locale?: string): Promise<NonNullable<Awaited<ReturnType<typeof getMarkdownContent>>>[]> {
  const slugs = getAllSlugs(collection)
  
  return Promise.all(
    slugs.map(async (slug) => {
      const content = await getMarkdownContent(collection, slug, locale)
      return content
    })
  ).then(results => results.filter(Boolean) as NonNullable<Awaited<ReturnType<typeof getMarkdownContent>>>[])
}

export async function getGameWithSubpages(gameSlug: string, locale?: string) {
  // Get game data
  const game = await getMarkdownContent('games', gameSlug, locale)
  
  if (!game) {
    return { game: null, subpages: [] }
  }
  
  // Get subpages for this game and locale
  const allSubpages = await getAllContent('subpages', locale)
  const subpages = allSubpages
    .filter((subpage): subpage is NonNullable<typeof subpage> => 
      subpage !== null && 
      subpage.data && 
      'game' in subpage.data && 
      subpage.data.game === gameSlug
    )
    .sort((a, b) => {
      const orderA = 'order' in a.data ? (a.data.order as number) || 0 : 0
      const orderB = 'order' in b.data ? (b.data.order as number) || 0 : 0
      return orderA - orderB
    })
  
  return { game, subpages }
}
// Empty optional number fields from the CMS can be saved as an empty string
function optionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined
}

// Kill team fields that are stored only in the default locale file
const KILL_TEAM_SHARED_FIELDS = ['factions', 'operatives', 'operatives_min', 'operatives_max', 'boxes', 'box_type', 'store_boxes', 'tier', 'skill', 'style', 'legal_until', 'image', 'second_image']
const KILL_TEAM_DEFAULT_LOCALE = 'en'

// Store boxes are separate entries that kill teams refer to by slug
async function getStoreBoxes(): Promise<Map<string, KillTeamStoreBox>> {
  const boxes = await getAllContent('storeboxes')
  return new Map(boxes.map(({ slug, data }) => {
    const box = data as unknown as KillTeamStoreBox
    return [slug, {
      slug,
      name: box.name,
      url: box.url || undefined,
      contrastphase_url: box.contrastphase_url || undefined,
      epicarium_url: box.epicarium_url || undefined,
    }]
  }))
}

function resolveStoreBoxes(teamSlug: string, slugs: unknown, storeBoxes: Map<string, KillTeamStoreBox>): KillTeamStoreBox[] | undefined {
  if (!Array.isArray(slugs) || !slugs.length) return undefined
  return slugs.map((slug) => {
    const box = storeBoxes.get(slug)
    if (!box) throw new Error(`Kill team "${teamSlug}" refers to unknown store box "${slug}"`)
    return box
  })
}

export async function getKillTeams(locale?: string): Promise<KillTeam[]> {
  const teams = await getAllContent('killteams', locale)
  const defaultTeams = locale && locale !== KILL_TEAM_DEFAULT_LOCALE
    ? await getAllContent('killteams', KILL_TEAM_DEFAULT_LOCALE)
    : teams
  const storeBoxes = await getStoreBoxes()

  return teams
    .map(({ slug, data, contentHtml }) => {
      // Only whether a team is reviewed reaches the page, not the reviewer's nickname
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { content_blocks, reviewed, ...rest } = data
      const defaultData = defaultTeams.find((t) => t.slug === slug)?.data ?? {}
      const shared = Object.fromEntries(KILL_TEAM_SHARED_FIELDS.map((field) => [field, defaultData[field]]))
      const team = { ...rest, ...shared } as unknown as Omit<KillTeam, 'slug' | 'store_boxes' | 'playstyleHtml' | 'imageVariants' | 'secondImageVariants'> & { store_boxes?: string[] }
      return {
        ...team,
        slug,
        tier: team.tier || undefined,
        reviewed: typeof reviewed === 'string' && reviewed.trim() !== '',
        operatives: optionalNumber(team.operatives),
        operatives_min: optionalNumber(team.operatives_min),
        operatives_max: optionalNumber(team.operatives_max),
        legal_until: optionalNumber(team.legal_until),
        boxes_note: team.boxes_note || undefined,
        store_boxes: resolveStoreBoxes(slug, team.store_boxes, storeBoxes),
        image: team.image || undefined,
        // Remote images have no generated size variants
        imageVariants: team.image && !/^https?:\/\//.test(team.image) ? generateImageVariants(team.image) : undefined,
        second_image: team.second_image || undefined,
        secondImageVariants: team.second_image && !/^https?:\/\//.test(team.second_image) ? generateImageVariants(team.second_image) : undefined,
        playstyleHtml: contentHtml,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}
