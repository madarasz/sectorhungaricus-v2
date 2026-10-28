import { ANALYTICS_PROVIDERS, UMAMI_DOMAINS, UMAMI_SCRIPT_URL, UMAMI_WEBSITE_ID } from '../config'
import { AnalyticsEventData } from '../events'
import { AnalyticsProvider } from './types'

declare global {
  interface Window {
    umami?: { track: (name: string, data?: AnalyticsEventData) => void }
  }
}

export const umamiProvider: AnalyticsProvider = {
  id: 'umami',
  enabled: ANALYTICS_PROVIDERS.umami,
  script: {
    src: UMAMI_SCRIPT_URL,
    attributes: {
      'data-website-id': UMAMI_WEBSITE_ID,
      'data-domains': UMAMI_DOMAINS,
      // The Team Chooser keeps its filters in the query, so query changes must not count as page views
      'data-exclude-search': 'true',
    },
  },
  track: (name, data) => window.umami?.track(name, data),
}
