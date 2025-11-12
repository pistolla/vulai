import type { AppProps } from 'next/app';
import Head from 'next/head';
import '@/styles/global.css';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ThemeProvider } from '@/components/ThemeProvider';
import { useEffect } from 'react';
import { subscribeAuth } from '@/services/firebase';
import { setUser } from '@/store/slices/authSlice';
import { setAdminData, clearAdminData } from '@/store/slices/adminSlice';
import { setCorrespondentData, clearCorrespondentData } from '@/store/slices/correspondentSlice';
import { setFanData, clearFanData } from '@/store/slices/fanSlice';
import { setSportTeamData, clearSportTeamData } from '@/store/slices/sportTeamSlice';
import { loadAdminData, loadFanData, loadSportTeamData } from '@/services/firestore';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize Firebase auth listener on app start
    subscribeAuth(async (user) => {
      try {
        store.dispatch(setUser(user));

        /* clear previous role data */
        store.dispatch(clearAdminData());
        store.dispatch(clearCorrespondentData());
        store.dispatch(clearFanData());
        store.dispatch(clearSportTeamData());

        if (!user) return;

        /* load role-specific slice */
        switch (user.role) {
          case 'admin': {
            try {
              const data = await loadAdminData();
              store.dispatch(setAdminData(data));
            } catch (error) {
              console.error('Failed to load admin data:', error);
            }
            break;
          }
          case 'correspondent':
              // Correspondent data loading is handled in components when needed
              break;
          case 'fan': {
            try {
              const data = await loadFanData(user.uid);
              store.dispatch(setFanData(data));
            } catch (error) {
              console.error('Failed to load fan data:', error);
            }
            break;
          }
          case 'sport-team': {
            if (!user.teamId) break;
            try {
              const data = await loadSportTeamData(user.teamId);
              store.dispatch(setSportTeamData(data));
            } catch (error) {
              console.error('Failed to load sport team data:', error);
            }
            break;
          }
        }
      } catch (error) {
        console.error('Error in auth listener:', error);
      }
    });
  }, []);

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
