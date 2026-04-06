import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/social.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* iOS Web App configuration */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SocialPoster" />
        <meta name="theme-color" content="#f2f2f7" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        <meta name="format-detection" content="telephone=no" />
        <title>SocialPoster - Sosiale medier-planlegger</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
