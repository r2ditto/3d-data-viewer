import type { AppProps } from "next/app";
import { Geist } from "next/font/google";
import { Header } from "@/components/header";

import "@/styles/globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${geist.variable} font-sans`}>
      <Header />
      <Component {...pageProps} />
    </main>
  );
}
