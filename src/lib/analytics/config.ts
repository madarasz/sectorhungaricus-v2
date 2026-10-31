import { BASE_URL } from '@/lib/seo'

// Central switches: set a provider to false to stop loading its script and sending its events
export const ANALYTICS_PROVIDERS = {
  simpleAnalytics: false,
  umami: true,
} as const

export const SIMPLE_ANALYTICS_SCRIPT_URL = 'https://scripts.simpleanalyticscdn.com/latest.js'

export const UMAMI_SCRIPT_URL = 'https://cloud.umami.is/script.js'
export const UMAMI_WEBSITE_ID = '8511690f-8fed-4f01-8f28-eb83a89cc404'
// Umami sends data only from this host, so local development and tests send nothing
export const UMAMI_DOMAINS = new URL(BASE_URL).hostname
// Global function that Umami calls before it sends data (data-before-send)
export const UMAMI_BEFORE_SEND = 'umamiBeforeSend'
