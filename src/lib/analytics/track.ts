import { AnalyticsEventMap, AnalyticsEventName } from './events'
import { enabledProviders } from './providers'

// Sends one event to all enabled providers. Analytics errors must never break the page.
export function trackEvent<K extends AnalyticsEventName>(name: K, data: AnalyticsEventMap[K]) {
  if (typeof window === 'undefined') return
  for (const provider of enabledProviders) {
    try {
      provider.track(name, data)
    } catch {
      // Provider script is blocked or broken
    }
  }
}
