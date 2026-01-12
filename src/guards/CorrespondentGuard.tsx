"use client";

import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { auth, db } from '@/services/firebase';
import { doc, getDoc } from 'firebase/firestore';
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
    if (hasChecked) return;

    const checkAuth = async () => {
      try {
        // Check if Firebase auth is still valid
        const currentUser = auth.currentUser;
        if (!currentUser) {
          router.replace('/login');
          return;
        }

        // Check cached user from Redux
        if (status === 'loading') return;

        if (!user) {
          router.replace('/login');
          return;
        }

        if (user.role !== 'correspondent') {
          router.replace('/403'); // or any "access denied" page you have
          return;
        }

        // Fetch user status from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userStatus = userData.status === true ? 'active' : 'pending';
          // Update user in Redux with status
          dispatch(setUser({ ...user, status: userStatus }));

          if (userStatus !== 'active') {
            router.replace('/correspondent/pending');
            setHasChecked(true);
            return;
          }
        } else {
          // User not in Firestore, assume pending
          router.replace('/correspondent/pending');
          setHasChecked(true);
          return;
        }

        setIsChecking(false);
        setHasChecked(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.replace('/login');
      }
    };

    checkAuth();
  }, [user, status, router, dispatch, hasChecked]);

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