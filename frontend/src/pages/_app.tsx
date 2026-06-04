import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style global jsx>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
        body { background: #000; color: #fff; -webkit-font-smoothing: antialiased; }

        input[type='range'] { -webkit-appearance: none; appearance: none; }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 22px; height: 22px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }
        input[type='range']::-moz-range-thumb {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
          border: none;
        }

        a { -webkit-tap-highlight-color: transparent; }

        ::selection { background: rgba(255,255,255,0.2); }

        @media (prefers-color-scheme: light) {
          html { color-scheme: dark; }
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
