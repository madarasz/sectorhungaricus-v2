import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'

interface CTAButtonProps {
  href: string
  icon: IconDefinition
  text: string
  variant: 'primary' | 'secondary'
}

export default function CTAButton({ href, icon, text, variant }: CTAButtonProps) {
  const isSecondary = variant === 'secondary'
  
  return (
    <Link
      href={href}
      className={`flex items-center mx-auto justify-center rounded-[10px] px-4 py-3 md:px-6 md:py-4 transition-all duration-300 hover:opacity-90 w-[13rem] ${
        isSecondary ? 'border-3' : ''
      }`}
      style={{
        minHeight: '60px',
        backgroundColor: isSecondary ? 'var(--button-secondary)' : 'var(--button-primary)',
        ...(isSecondary && { borderColor: 'var(--button-border)' })
      }}
    >
      <FontAwesomeIcon
        icon={icon}
        className="text-2xl md:text-4xl mr-2 md:mr-4"
        style={{
          color: isSecondary ? 'var(--button-secondary-text)' : 'var(--button-primary-text)'
        }}
      />
      <span
        className="font-poppins font-medium text-[16px] md:text-[20px] leading-[24px] md:leading-[30px]"
        style={{
          color: isSecondary ? 'var(--button-secondary-text)' : 'var(--button-primary-text)'
        }}
      >
        {text}
      </span>
    </Link>
  )
}