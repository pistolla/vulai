import { useAppSelector } from '@/hooks/redux';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

interface Props {
  children: React.ReactNode;
}

export default function FanGuard({ children }: Props) {
  const { user, status } = useAppSelector(s => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // wait for auth to load
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'fan') {
      router.replace('/403'); // or any "access denied" page you have
    }
  }, [user, status, router]);

  /* don't render until check is done */
  if (status === 'loading' || !user || user.role !== 'fan') return null;

  return <>{children}</>;
}