import { LocaleProvider } from "@/contexts/LocaleContext";
import { Locale, getLocalizedPath } from "@/lib/locale-utils";
import Navigation from "@/components/Navigation";
import { getMarkdownContent } from "@/lib/markdown";
import { BASE_URL, SITE_NAME } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import Link from "next/link";
import KofiWidget from "@/components/KofiWidget";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export async function generateStaticParams() {
  return [{ locale: 'hu' }, { locale: 'en' }] // Generate both Hungarian and English versions
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  const validLocale = locale as Locale;

  // Fetch navigation data from CMS based on current locale
  const [calendarData, aboutData, supportData] = await Promise.allSettled([
    getMarkdownContent('pages', 'calendar', validLocale),
    getMarkdownContent('pages', 'about-us', validLocale),
    getMarkdownContent('pages', 'support-us', validLocale)
  ])
  
  const calendarTitle = (
    calendarData.status === 'fulfilled' && calendarData.value?.data?.title as string
  ) || ''
  
  const aboutTitle = (
    aboutData.status === 'fulfilled' && aboutData.value?.data?.title as string
  ) || ''
  
  const supportTitle = (
    supportData.status === 'fulfilled' && supportData.value?.data?.title as string
  ) || ''

  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: SITE_NAME,
    url: `${BASE_URL}/${validLocale}/`,
    logo: `${BASE_URL}/uploads/sh-logo.png`,
    sameAs: ['https://discord.gg/sX46Y83puz'],
    areaServed: [
      { '@type': 'Country', name: 'Hungary' },
      { '@type': 'City', name: 'Budapest' },
    ],
    knowsAbout: ['Kill Team', 'Warhammer 40,000', 'Tabletop wargaming', 'Spearhead'],
  }

  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: BASE_URL,
    inLanguage: validLocale === 'hu' ? 'hu-HU' : 'en-US',
  }

  return (
    <LocaleProvider initialLocale={validLocale}>
      <JsonLd data={[organizationLd, websiteLd]} />
      <Navigation calendarTitle={calendarTitle} aboutTitle={aboutTitle} supportTitle={supportTitle} />
      <main className="min-h-screen">
        {children}
      </main>
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 md:px-8 xl:px-16 text-center max-w-[64rem]">
          <div className="flex items-center justify-center flex-wrap gap-2">
            <span>
              &copy; 2024 Sector Hungaricus. All rights reserved.
            </span>
            {aboutTitle && (
              <>
                <span>|</span>
                <Link 
                  href={getLocalizedPath("/about", validLocale)} 
                  style={{color: '#ffffff'}}
                >
                  {aboutTitle}
                </Link>
              </>
            )}
            <span>|</span>
            <KofiWidget 
              buttonText={supportTitle} 
              variant="button" 
              buttonBackgroundColor="var(--hero-background)"
              buttonBorderColor="#ffffff"
            />
          </div>
        </div>
      </footer>
    </LocaleProvider>
  );
}