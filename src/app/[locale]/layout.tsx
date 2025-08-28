import { LocaleProvider, Locale } from "@/contexts/LocaleContext";
import Navigation from "@/components/Navigation";
import { getMarkdownContent } from "@/lib/markdown";

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
  const calendarData = await getMarkdownContent('pages', 'calendar', validLocale)
  const aboutData = await getMarkdownContent('pages', 'about-us', validLocale)
  
  const calendarTitle = calendarData?.data?.title || ''
  const aboutTitle = aboutData?.data?.title || ''

  return (
    <LocaleProvider initialLocale={validLocale}>
      <Navigation calendarTitle={calendarTitle} aboutTitle={aboutTitle} />
      <main className="min-h-screen">
        {children}
      </main>
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 md:px-8 xl:px-16 text-center max-w-[64rem]">
          <p>&copy; 2024 Sector Hungaricus. All rights reserved.</p>
        </div>
      </footer>
    </LocaleProvider>
  );
}