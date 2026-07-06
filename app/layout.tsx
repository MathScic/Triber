import "./globals.css";
import { Inter, Nunito, Barlow_Condensed } from "next/font/google";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const barlow = Barlow_Condensed({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-barlow" });

export const metadata = {
  title: "Triber",
  description: "La gestion de club tout-en-un",
  icons: { icon: "/images/icon-triber.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.className} ${nunito.variable} ${barlow.variable} min-h-screen flex flex-col bg-white text-gray-900`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <main className="flex-grow">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
