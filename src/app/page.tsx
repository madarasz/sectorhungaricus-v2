import Link from 'next/link'

export default function RootPage() {
  return (
    <div>
      <h1>Welcome</h1>
      <p>You should not see this page in production, this is dev only. Production server should redirect you to the appropriate locale.</p>
      <ul>
        <li><Link href="/en">English</Link></li>
        <li><Link href="/hu">Magyar</Link></li>
      </ul>
    </div>
  )
}