export default function RootPage() {
  return (
    <div>
      <h1>Welcome</h1>
      <p>You should not see this page in production, this is dev only. Production server should redirect you to the appropriate locale.</p>
      <ul>
        <li><a href="/en">English</a></li>
        <li><a href="/hu">Magyar</a></li>
      </ul>
    </div>
  )
}