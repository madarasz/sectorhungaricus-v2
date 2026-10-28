import { enabledProviders } from '@/lib/analytics/providers'

// Loads the script of each enabled analytics provider
export default function AnalyticsScripts() {
  return (
    <>
      {enabledProviders.map(({ id, script }) => (
        <script key={id} defer src={script.src} {...script.attributes} />
      ))}
    </>
  )
}
