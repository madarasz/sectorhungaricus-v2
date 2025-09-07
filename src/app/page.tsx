export default function RootPage() {
  return (
    <html>
      <head>
        <meta httpEquiv="refresh" content="0; url=/hu" />
        <title>Redirecting...</title>
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --background: #EAE9E9;
              --foreground: #1A1A1A;
            }
            
            :root.dark {
              --background: #1A1A1A;
              --foreground: #EAE9E9;
            }
            
            body {
              background: var(--background);
              color: var(--foreground);
              font-family: system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 20px;
              transition: background-color 0.3s ease, color 0.3s ease;
            }
            
            a {
              color: #3B82F6;
              text-decoration: underline;
            }
            
            .dark a {
              color: #60A5FA;
            }
          `
        }} />
        <script dangerouslySetInnerHTML={{
          __html: `
            // Apply theme before page renders
            (function() {
              const savedTheme = localStorage.getItem('preferred-theme');
              const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
              document.documentElement.classList.add(theme);
            })();
          `
        }} />
      </head>
      <body>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <p>Redirecting to <a href="/hu">/hu</a>...</p>
        <script dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined') {
              window.location.href = '/hu';
            }
          `
        }} />
      </body>
    </html>
  )
}