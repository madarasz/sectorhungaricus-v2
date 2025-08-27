import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "../lib/fontawesome";

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
    <html lang="hu">
      <body className={`${inter.variable} ${poppins.variable} ${namdhinggo.variable} ${montserratSubrayada.variable} font-sans antialiased`} style={{backgroundColor: '#EAE9E9'}}>
        {children}
      </body>
    </html>
  );
}
