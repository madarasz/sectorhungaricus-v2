import { LINK_TYPES } from '@/lib/analytics/events'

// Placeholder attribute for a store box in the HTML of CMS text, replaced by the StoreBoxLinks component
export const STORE_BOX_ATTRIBUTE = 'data-store-box'

// Webstores of a store box, in the order of their icons after the product name.
// utm: the links to the store get the UTM parameters of this site
export const STORES = [
  { id: 'contrastphase', name: 'ContrastPhase', field: 'contrastphase_url', icon: '/images/stores/contrastphase.png', linkType: LINK_TYPES.contrastPhase, utm: true },
  { id: 'epicarium', name: 'Epicarium', field: 'epicarium_url', icon: '/images/stores/epicarium.svg', linkType: LINK_TYPES.epicarium, utm: true },
  { id: 'warhammer', name: 'Warhammer Store', field: 'url', icon: '/images/stores/warhammer.png', linkType: LINK_TYPES.warhammerStore, utm: false },
] as const

export type Store = (typeof STORES)[number]

// Store that the product name links to. A box without a URL in this store shows the name as plain text.
export const NAME_LINK_STORE_ID: Store['id'] = 'contrastphase'
export const NAME_LINK_STORE: Store = STORES.find((store) => store.id === NAME_LINK_STORE_ID)!

// UTM parameters that let the webstores identify the traffic that comes from this site
export const STORE_LINK_UTM_PARAMS = {
  utm_source: 'sectorhungaricus.hu',
  utm_medium: 'referral',
} as const

// Link URL to a store: with the UTM parameters when the store gets them, keeps the query and hash of the URL
export function storeLinkUrl(store: Store, url: string): string {
  if (!store.utm) return url
  const result = new URL(url)
  for (const [key, value] of Object.entries(STORE_LINK_UTM_PARAMS)) {
    result.searchParams.set(key, value)
  }
  return result.href
}
