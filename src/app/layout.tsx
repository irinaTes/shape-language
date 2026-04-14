import { PrismicPreview } from "@prismicio/next";
import { createClient, repositoryName } from "@/prismicio";
import "./globals.css";
import { FooterDocument, HeaderDocument } from "../../prismicio-types";
import Header from "./components/Header";
import localFont from "next/font/local";
import { cn } from "./utils/utils";
import Footer from "./components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import TextBackground from "@/components/TextBackground";
import PageWithLoading from "@/components/PageWithLoading";
import CursorTrail from "@/components/CursorTrail";

const DarkerGrotesque = localFont({
  src: [
    { path: './assets/font/DarkerGrotesque.woff2' },
    { path: './assets/font/DarkerGrotesque.ttf' },
  ],
  variable: '--font-grotesque',
  display: "swap",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
  preload: true,
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const client = createClient();

  const [header, footer] = await Promise.all([
    client.getSingle("header"),
    client.getSingle("footer"),
  ]);

  return (
    <html lang="en">
      <body className={cn(DarkerGrotesque.className, "relative bg-primary text-white text-2xl tracking-wide overflow-x-hidden scanlines")}>
        {/* <GenerativeTypographyBackground wordCount={65} /> */}
        <ParticleBackground />
        <CursorTrail />
        <div className="relative">
          <TextBackground />
          <PageWithLoading>
            <Header data={header as HeaderDocument} />

            <div className="flex flex-1 flex-col relative z-10">
              {children}
              <PrismicPreview repositoryName={repositoryName} />
            </div>
            <Footer data={footer as FooterDocument} headerData={header as HeaderDocument}/>
          </PageWithLoading>
        </div>

      </body>
    </html>
  );
}
