import type { AppProps } from 'next/app';
import Head from 'next/head';
import '@/styles/global.css';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ThemeProvider } from '@/components/ThemeProvider';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="University sports excellence at Unill" />
        <link rel="icon" href="/images/logo.png" />
      </Head>
      <Provider store={store}>
        <ThemeProvider>
          <Component {...pageProps} />
        </ThemeProvider>
      </Provider>
    </>
  );
}
