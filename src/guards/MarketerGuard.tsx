import { useAppSelector } from '@/hooks/redux';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { auth } from '@/services/firebase';

export default function MarketerGuard({ children }: { children: React.ReactNode }) {
  const { user, status } = useAppSelector(s => s.auth);
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
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

        if (user.role !== 'marketer') {
          router.replace('/403');
          return;
        }

        setIsChecking(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.replace('/login');
      }
    };

    checkAuth();
  }, [user, status, router]);

  // Show loading while checking authentication
  if (isChecking || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent shadow-xl"></div>
          <p className="text-gray-500 font-medium animate-pulse">Authenticating Marketer...</p>
        </div>
      </div>
    );
  }

  // Don't render if user doesn't have marketer role
  if (!user || user.role !== 'marketer') {
    return null;
  }

  return <>{children}</>;
}
