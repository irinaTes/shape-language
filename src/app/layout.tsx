import { PrismicPreview } from "@prismicio/next";
import { createClient, repositoryName } from "@/prismicio";
import "./globals.css";
import { HeaderDocument } from "../../prismicio-types";
import Header from "./components/Header";
import localFont from "next/font/local";
import { cn } from "./utils/utils";

const AROneSans = localFont({
  src: './assets/font/AROneSans.ttf',
  variable: '--font-ar-one-sans',
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
      <body className={cn(AROneSans.className, Sardin.variable, TuskerGrotesk.variable, "bg-primary text-white text-2xl tracking-wide")}>
        {/* <Header data={header as HeaderDocument} /> */}

        <div className="flex flex-1 flex-col pt-20">
          {/* <h1 className="font-extralight ml-10 mt-20 ">Ia sa vedem ce zice</h1> */}
          {children}
          <PrismicPreview repositoryName={repositoryName} />
        </div>
      </body>
    </html>
  );
}
