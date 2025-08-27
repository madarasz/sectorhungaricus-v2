import { LocaleProvider, Locale } from "@/contexts/LocaleContext";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export async function generateStaticParams() {
  return [{ locale: 'en' }] // Only generate English version (Hungarian is default at root)
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  const validLocale = locale as Locale;

  return (
    <LocaleProvider initialLocale={validLocale}>
      {children}
    </LocaleProvider>
  );
}