import { useAppSelector } from '@/hooks/redux';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAppSelector(s => s.auth.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    if (user.role !== 'admin') router.replace('/403');
  }, [user, router]);

  if (!user || user.role !== 'admin') return null;
  return <>{children}</>;
}
