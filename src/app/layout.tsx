import { PrismicPreview } from "@prismicio/next";
import { createClient, repositoryName } from "@/prismicio";
import "./globals.css";
import { FooterDocument, HeaderDocument } from "../../prismicio-types";
import Header from "./components/Header";
import localFont from "next/font/local";
import { cn } from "./utils/utils";
import Footer from "./components/Footer";
import GenerativeTypographyBackground from "@/components/GenerativeTypographyBackground";

const AROneSans = localFont({
  src: './assets/font/AROneSans.ttf',
  variable: '--font-ar-one-sans',
  display: "swap",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

const DarkerGrotesque = localFont({
  src: './assets/font/DarkerGrotesque.ttf',
  variable: '--font-grotesque',
  display: "swap",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

const Sardin = localFont({
  src: './assets/font/sardin.otf',
  variable: '--font-sardin',
  display: "swap",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

const TuskerGrotesk = localFont({
  src: './assets/font/TuskerGrotesk.otf',
  variable: '--font-tusker-grotesk',
  display: "swap",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
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
      <body className={cn(DarkerGrotesque.className, "bg-primary text-white text-2xl tracking-wide")}>
        <GenerativeTypographyBackground wordCount={65} />

        {/* <PageWithLoading> */}
        <Header data={header as HeaderDocument} />

        <div className="flex flex-1 flex-col relative z-10">
          {children}
          <PrismicPreview repositoryName={repositoryName} />
        </div>
        {/* </PageWithLoading> */}
        <Footer data={footer as FooterDocument} headerData={header as HeaderDocument}/>

      </body>
    </html>
  );
}
