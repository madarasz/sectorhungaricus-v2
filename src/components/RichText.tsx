import { CSSProperties } from 'react'
import parse, { DOMNode, Element } from 'html-react-parser'
import { KillTeamStoreBox } from '@/types/content'
import { STORE_BOX_ATTRIBUTE } from '@/lib/storeBoxes'
import StoreBoxLinks from './StoreBoxLinks'

interface RichTextProps {
  html: string
  // Store boxes that the placeholders of the HTML refer to, by slug
  storeBoxes?: Record<string, KillTeamStoreBox>
  className?: string
  style?: CSSProperties
  'data-testid'?: string
  'data-style'?: string
}

// HTML of CMS text, with the store box placeholders shown as store links
export default function RichText({ html, storeBoxes, ...props }: RichTextProps) {
  if (!storeBoxes) {
    return <div {...props} dangerouslySetInnerHTML={{ __html: html }} />
  }

  return (
    <div {...props}>
      {parse(html, {
        replace: (node: DOMNode) => {
          if (!(node instanceof Element)) return
          const slug = node.attribs[STORE_BOX_ATTRIBUTE]
          if (slug && storeBoxes[slug]) return <StoreBoxLinks box={storeBoxes[slug]} variant="text" />
        },
      })}
    </div>
  )
}
