import { LINK_TYPES } from '@/lib/analytics/events'

// Placeholder attribute for a store box in the HTML of CMS text, replaced by the StoreBoxLinks component
export const STORE_BOX_ATTRIBUTE = 'data-store-box'

// Webstores of a store box, in the order of their icons after the product name
export const STORES = [
  { id: 'contrastphase', name: 'ContrastPhase', field: 'contrastphase_url', icon: '/images/stores/contrastphase.png', linkType: LINK_TYPES.contrastPhase },
  { id: 'epicarium', name: 'Epicarium', field: 'epicarium_url', icon: '/images/stores/epicarium.svg', linkType: LINK_TYPES.epicarium },
  { id: 'warhammer', name: 'Warhammer Store', field: 'url', icon: '/images/stores/warhammer.png', linkType: LINK_TYPES.warhammerStore },
] as const

export type Store = (typeof STORES)[number]

// Store that the product name links to. A box without a URL in this store shows the name as plain text.
export const NAME_LINK_STORE_ID: Store['id'] = 'warhammer'
export const NAME_LINK_STORE: Store = STORES.find((store) => store.id === NAME_LINK_STORE_ID)!
