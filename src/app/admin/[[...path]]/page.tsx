import { redirect } from 'next/navigation'

export function generateStaticParams() {
  // Generate empty params for the root /admin/ path
  return [{ path: [] }]
}

export default function AdminRedirect() {
  redirect('/admin/index.html')
}
