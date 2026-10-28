import { ANALYTICS_PROVIDERS, SIMPLE_ANALYTICS_SCRIPT_URL } from '../config'
import { AnalyticsEventData } from '../events'
import { AnalyticsProvider } from './types'

declare global {
  interface Window {
    sa_event?: (name: string, metadata?: AnalyticsEventData) => void
  }
}

export const simpleAnalyticsProvider: AnalyticsProvider = {
  id: 'simple-analytics',
  enabled: ANALYTICS_PROVIDERS.simpleAnalytics,
  script: { src: SIMPLE_ANALYTICS_SCRIPT_URL },
  track: (name, data) => window.sa_event?.(name, data),
}
