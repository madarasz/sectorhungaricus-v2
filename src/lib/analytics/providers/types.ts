import { AnalyticsEventData } from '../events'

export interface AnalyticsScript {
  src: string
  attributes?: Record<string, string>
}

export interface AnalyticsProvider {
  id: string
  enabled: boolean
  script: AnalyticsScript
  track: (name: string, data: AnalyticsEventData) => void
}
