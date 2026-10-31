import { Fragment } from 'react'
import { enabledProviders } from '@/lib/analytics/providers'

// Loads the script of each enabled analytics provider
export default function AnalyticsScripts() {
  return (
    <>
      {enabledProviders.map(({ id, script }) => (
        <Fragment key={id}>
          {script.setup && <script dangerouslySetInnerHTML={{ __html: script.setup }} />}
          <script defer src={script.src} {...script.attributes} />
        </Fragment>
      ))}
    </>
  )
}
