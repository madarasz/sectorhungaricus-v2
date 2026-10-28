'use client'

import { useEffect } from 'react'
import { LINK_DATA_ATTRIBUTE_PREFIX } from '@/lib/analytics/events'
import { trackEvent } from '@/lib/analytics/track'

// data-analytics-link-type becomes link_type in the event data
function linkData(link: HTMLAnchorElement) {
  const data: Record<string, string> = {}
  for (const [key, value] of Object.entries(link.dataset)) {
    if (!key.startsWith(LINK_DATA_ATTRIBUTE_PREFIX) || value === undefined) continue
    const name = key.slice(LINK_DATA_ATTRIBUTE_PREFIX.length)
    data[name.replace(/^./, (c) => c.toLowerCase()).replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)] = value
  }
  return data
}

// One listener for the whole document, so links in CMS content are tracked too
export default function OutboundLinkTracker() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // auxclick also fires for the right button, which does not open the link
      if (e.type === 'auxclick' && e.button !== 1) return
      const link = (e.target as Element | null)?.closest?.('a[href]')
      if (!(link instanceof HTMLAnchorElement)) return
      const url = new URL(link.href, window.location.href)
      if (!url.protocol.startsWith('http') || url.origin === window.location.origin) return
      trackEvent('outbound_link_click', { ...linkData(link), url: url.href, page: window.location.pathname })
    }

    document.addEventListener('click', handleClick, true)
    document.addEventListener('auxclick', handleClick, true)
    return () => {
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('auxclick', handleClick, true)
    }
  }, [])

  return null
}
