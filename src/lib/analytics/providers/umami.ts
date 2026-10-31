import { LOCALE_PREFIX } from '@/lib/locale-utils'
import { ANALYTICS_PROVIDERS, UMAMI_BEFORE_SEND, UMAMI_DOMAINS, UMAMI_SCRIPT_URL, UMAMI_WEBSITE_ID } from '../config'
import { AnalyticsEventData } from '../events'
import { AnalyticsProvider } from './types'

declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: AnalyticsEventData) => void
      identify: (data: AnalyticsEventData) => void
    }
  }
}

// Umami gets the URL and the in-site referrer without the locale prefix, so the stats of the language versions of a page add up.
// The URL can be a path or a full URL, depending on the tracker version.
// The locale of custom events goes to the event data (trackEvent). Page views cannot have event data, so the locale
// also goes to the session data (identify). Decision: the session data keeps only the last locale of the session.
// A session that uses both languages shows only the last one. This is accepted, because the exact locale of each page view is not necessary.
const beforeSend = `(function () {
  var prefix = new RegExp(${JSON.stringify(LOCALE_PREFIX.source)});
  var identified;
  function strip(url) {
    try {
      var u = new URL(url, window.location.origin);
      if (u.origin !== window.location.origin) return url;
      var path = (u.pathname.replace(prefix, '') || '/') + u.search + u.hash;
      return /^https?:/.test(url) ? u.origin + path : path;
    } catch (e) {
      return url;
    }
  }
  window[${JSON.stringify(UMAMI_BEFORE_SEND)}] = function (type, payload) {
    if (payload && typeof payload.url === 'string') payload.url = strip(payload.url);
    if (payload && typeof payload.referrer === 'string' && payload.referrer) payload.referrer = strip(payload.referrer);
    // identify sends with type "identify", so this does not loop. It runs again only when the locale changes.
    var match = window.location.pathname.match(prefix);
    if (type === 'event' && match && match[1] !== identified) {
      identified = match[1];
      setTimeout(function () {
        if (window.umami) window.umami.identify({ locale: identified });
      });
    }
    return payload;
  };
})();`

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
      'data-before-send': UMAMI_BEFORE_SEND,
    },
    setup: beforeSend,
  },
  track: (name, data) => window.umami?.track(name, data),
}
