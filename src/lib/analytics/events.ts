// Event names use snake_case, which every provider accepts
export type AnalyticsEventMap = {
  outbound_link_click: { url: string; page: string; link_type?: string; team?: string }
  gallery_open: { page: string; gallery?: string; image_index: number }
  kt_filter_change: { filter: string; value: string; selected: boolean }
  kt_filter_reset: Record<string, never>
  kt_team_select: { team: string }
}

export type AnalyticsEventName = keyof AnalyticsEventMap

export type AnalyticsEventData = Record<string, string | number | boolean | undefined>

// Values for the data-analytics-link-type attribute of outgoing links
export const LINK_TYPES = {
  warhammerStore: 'warhammer_store',
} as const

// Outgoing links send all their data-analytics-* attributes as event data
export const LINK_DATA_ATTRIBUTE_PREFIX = 'analytics'
