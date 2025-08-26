import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
});


export const metadata: Metadata = {
  title: "Sector Hungaricus - Skirmish Gaming Community",
  description: "Hungarian skirmish gaming community focusing on Kill Team, Spearhead and other tabletop games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`} style={{backgroundColor: '#EAE9E9'}}>
        <Navigation />
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
