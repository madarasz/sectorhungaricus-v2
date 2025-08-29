import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "../lib/fontawesome";
import { ThemeProvider } from "@/contexts/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
});

const namdhinggo = localFont({
  src: [
    {
      path: "../fonts/Namdhinggo-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Namdhinggo-Medium.ttf", 
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/Namdhinggo-SemiBold.ttf",
      weight: "600", 
      style: "normal",
    },
    {
      path: "../fonts/Namdhinggo-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/Namdhinggo-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-namdhinggo",
});

const montserratSubrayada = localFont({
  src: [
    {
      path: "../fonts/MontserratSubrayada-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/MontserratSubrayada-Bold.ttf",
      weight: "700", 
      style: "normal",
    },
  ],
  variable: "--font-montserrat-subrayada",
});


export const metadata: Metadata = {
  title: "Sector Hungaricus - Skirmish Gaming Community",
  description: "Hungarian skirmish gaming community focusing on Kill Team, Spearhead and other tabletop games",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="hu" className="light" suppressHydrationWarning={true}>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                // Set theme
                var savedTheme = localStorage.getItem('preferred-theme');
                var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                var theme = savedTheme || systemTheme || 'light';
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(theme);
                
                // Set language
                var pathLocale = window.location.pathname.startsWith('/en') ? 'en' : 'hu';
                document.documentElement.setAttribute('lang', pathLocale);
              } catch (e) {
                // Fallback: ensure defaults are applied
                document.documentElement.classList.add('light');
                document.documentElement.setAttribute('lang', 'hu');
              }
            })();
          `
        }} />
      </head>
      <body className={`${inter.variable} ${poppins.variable} ${namdhinggo.variable} ${montserratSubrayada.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
