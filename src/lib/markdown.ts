import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const contentDirectory = path.join(process.cwd(), 'content')

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

  return {
    slug,
    data,
    contentHtml,
  }
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