/**
 * Utility for safely loading client-side libraries (AOS, Feather Icons)
 * to prevent hydration errors in Next.js
 */

let aosLoaded = false;
let featherLoaded = false;

export const initClientSideLibs = async (): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    const promises: Promise<any>[] = [];

    // Load AOS if not already loaded
    if (!aosLoaded) {
      promises.push(
        import('aos').then(async ({ default: AOS }) => {
          // Add AOS CSS dynamically
          if (!document.querySelector('link[href*="aos.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/aos@2.3.1/dist/aos.css';
            document.head.appendChild(link);
          }
          
          AOS.init({ once: true });
          aosLoaded = true;
          return AOS;
        })
      );
    }

    // Load Feather Icons if not already loaded
    if (!featherLoaded) {
      promises.push(
        import('feather-icons').then(({ default: feather }) => {
          feather.replace();
          featherLoaded = true;
          return feather;
        })
      );
    }

    await Promise.all(promises);
  } catch (error) {
    console.warn('Failed to load client-side libraries:', error);
  }
};

export const useClientSideLibs = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initClientSideLibs();
  }, []);

  return mounted;
};

// For React imports
import { useEffect, useState } from 'react';