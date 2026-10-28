import { simpleAnalyticsProvider } from './simpleAnalytics'
import { AnalyticsProvider } from './types'
import { umamiProvider } from './umami'

// Add new providers here
const ALL_PROVIDERS: AnalyticsProvider[] = [simpleAnalyticsProvider, umamiProvider]

export const enabledProviders = ALL_PROVIDERS.filter((provider) => provider.enabled)
