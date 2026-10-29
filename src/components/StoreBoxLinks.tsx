import Image from 'next/image'
import { KillTeamStoreBox } from '@/types/content'
import { NAME_LINK_STORE, STORES } from '@/lib/storeBoxes'

// "detail" is the small text of the team details, "text" is the body text of CMS content
const VARIANT_STYLES = {
  detail: {
    nameLink: 'underline underline-offset-2 hover:opacity-80',
    iconLink: 'ml-2.5 xl:ml-1.5 p-1 xl:p-0.5 -my-1 xl:-my-0.5',
    icon: 'w-6 h-6 xl:w-3.5 xl:h-3.5',
  },
  text: {
    nameLink: '',
    iconLink: 'ml-1.5 p-1 md:p-0.5 -my-1 md:-my-0.5',
    icon: 'w-6 h-6 md:w-5 md:h-5',
  },
} as const

interface StoreBoxLinksProps {
  box: KillTeamStoreBox
  variant: keyof typeof VARIANT_STYLES
  // Kill team slug for the analytics event, when the links are shown for a team
  team?: string
}

export default function StoreBoxLinks({ box, variant, team }: StoreBoxLinksProps) {
  const styles = VARIANT_STYLES[variant]
  const nameUrl = box[NAME_LINK_STORE.field]

  return (
    <span data-testid="store-box">
      {nameUrl ? (
        <a href={nameUrl} target="_blank" rel="noopener noreferrer" className={styles.nameLink} data-testid="store-box-name-link" data-analytics-link-type={NAME_LINK_STORE.linkType} data-analytics-team={team} data-analytics-box={box.slug}>
          {box.name}
        </a>
      ) : (
        <span data-testid="store-box-name">{box.name}</span>
      )}
      {STORES.map((store) => box[store.field] && (
        <a
          key={store.id}
          href={box[store.field]}
          target="_blank"
          rel="noopener noreferrer"
          title={store.name}
          // not-prose: the CMS text styles must not add image margins
          className={`not-prose inline-flex align-middle rounded-sm bg-white hover:opacity-80 ${styles.iconLink}`}
          data-testid={`store-box-icon-${store.id}`}
          data-analytics-link-type={store.linkType}
          data-analytics-team={team}
          data-analytics-box={box.slug}
        >
          <Image src={store.icon} alt={store.name} width={16} height={16} className={styles.icon} unoptimized />
        </a>
      ))}
    </span>
  )
}
