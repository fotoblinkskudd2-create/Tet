import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/declutter.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Digital Minimalism Enforcer</title>
        <meta name="description" content="Effortless cleanup, guilt-free living" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Declutter" />
        <meta name="theme-color" content="#007AFF" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
