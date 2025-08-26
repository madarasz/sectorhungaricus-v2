import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "../lib/fontawesome";
import Navigation from "@/components/Navigation";
import { getMarkdownContent } from "@/lib/markdown";

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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch navigation data from CMS
  const calendarData = await getMarkdownContent('pages', 'calendar', 'hu')
  const aboutData = await getMarkdownContent('pages', 'about-us', 'hu')
  
  const calendarTitle = calendarData?.data?.title
  const aboutTitle = aboutData?.data?.title

  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} ${namdhinggo.variable} ${montserratSubrayada.variable} font-sans antialiased`} style={{backgroundColor: '#EAE9E9'}}>
        <Navigation calendarTitle={calendarTitle} aboutTitle={aboutTitle} />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-gray-900 text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2024 Sector Hungaricus. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
