"use client";

import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { auth, db } from '@/services/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { setUser } from '@/store/slices/authSlice';

interface Props {
  children: React.ReactNode;
}

export default function CorrespondentGuard({ children }: Props) {
  const { user, status } = useAppSelector(s => s.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Check if Firebase auth is still valid
    const currentUser = auth.currentUser;
    if (!currentUser && status !== 'loading') {
      router.replace('/login');
      return;
    }

    if (!user || status === 'loading') return;

    if (user.role !== 'correspondent') {
      router.replace('/403');
      return;
    }

    // Real-time listener for user status changes
    const unsub = onSnapshot(doc(db, 'users', user.uid), (userDoc: any) => {
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const isActive = userData.status === true || userData.status === 'active';
        const consentSigned = userData.consentSigned === true;

        if (!isActive) {
          if (consentSigned) {
            if (router.pathname !== '/correspondent/wait-approval') {
              router.replace('/correspondent/wait-approval');
            }
          } else {
            if (router.pathname !== '/correspondent/pending') {
              router.replace('/correspondent/pending');
            }
          }
        } else {
          // User is active! 
          // If they were on a pending/wait page, bring them to dashboard
          if (router.pathname === '/correspondent/pending' || router.pathname === '/correspondent/wait-approval') {
            router.replace('/correspondent');
          }
          setIsChecking(false);
        }
      } else {
        // User not in Firestore, assume pending
        if (router.pathname !== '/correspondent/pending') {
          router.replace('/correspondent/pending');
        }
      }
      setHasChecked(true);
    }, (error: any) => {
      console.error('Auth snapshot failed:', error);
      router.replace('/login');
    });

    return () => unsub();
  }, [user, status, router, hasChecked]);

  // Show loading while checking authentication
  if (isChecking || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if user doesn't have correspondent role
  if (!user || user.role !== 'correspondent') {
    return null;
  }

  return <>{children}</>;
}