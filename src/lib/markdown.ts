import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import { ContentBlock } from '@/types/content'

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

async function processContentBlocks(blocks: ContentBlock[]): Promise<ContentBlock[]> {
  const processedBlocks = []
  
  for (const block of blocks) {
    const processedBlock = { ...block }
    
    if (block.content) {
      processedBlock.content = await processMarkdownString(block.content)
    }
    if (block.left_content) {
      processedBlock.left_content = await processMarkdownString(block.left_content)
    }
    if (block.right_content) {
      processedBlock.right_content = await processMarkdownString(block.right_content)
    }
    
    processedBlocks.push(processedBlock)
  }
  
  return processedBlocks
}

export async function getMarkdownContent(collection: string, slug: string, locale?: string) {
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
    data.content_blocks = await processContentBlocks(data.content_blocks as ContentBlock[])
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

export function getAllContent(collection: string, locale?: string) {
  const slugs = getAllSlugs(collection)
  
  return Promise.all(
    slugs.map(async (slug) => {
      const content = await getMarkdownContent(collection, slug, locale)
      return content
    })
  ).then(results => results.filter(Boolean))
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