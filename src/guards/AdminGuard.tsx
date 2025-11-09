import { useAppSelector } from '@/hooks/redux';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { auth } from '@/services/firebase';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
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

        if (user.role !== 'admin') {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if user doesn't have admin role
  if (!user || user.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
