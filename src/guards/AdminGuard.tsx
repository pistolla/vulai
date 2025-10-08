import { useAppSelector } from '@/hooks/redux';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, status } = useAppSelector(s => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // wait for auth to load
    if (!user) { router.replace('/login'); return; }
    if (user.role !== 'admin') router.replace('/403');
  }, [user, status, router]);

  if (status === 'loading' || !user || user.role !== 'admin') return null;
  return <>{children}</>;
}
