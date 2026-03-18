import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="theme-color" content="#1a73e8" />
        <link rel="manifest" href="/manifest.json" />
        <title>Grafset + OpenClaw</title>
        <meta
          name="description"
          content="Smart, cheap creative ideas powered by AI agents — built for iOS web"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
