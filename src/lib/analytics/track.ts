import { localePrefixOf, removeLocalePrefix } from '@/lib/locale-utils'
import { AnalyticsEventMap, AnalyticsEventName } from './events'
import { enabledProviders } from './providers'

// Current page without the locale prefix, so the events of the language versions of a page add up
export function analyticsPage() {
  return removeLocalePrefix(window.location.pathname)
}

// Sends one event to all enabled providers, with the locale of the page. Analytics errors must never break the page.
export function trackEvent<K extends AnalyticsEventName>(name: K, data: AnalyticsEventMap[K]) {
  if (typeof window === 'undefined') return
  const eventData = { ...data, locale: localePrefixOf(window.location.pathname) }
  for (const provider of enabledProviders) {
    try {
      provider.track(name, eventData)
    } catch {
      // Provider script is blocked or broken
    }
  }
}
