import { useAppSelector } from '@/hooks/redux';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

interface Props {
  children: React.ReactNode;
}

export default function CorrespondentGuard({ children }: Props) {
  const user = useAppSelector(s => s.auth.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'correspondent') {
      router.replace('/403'); // or any “access denied” page you have
    }
  }, [user, router]);

  /* don’t render until check is done */
  if (!user || user.role !== 'correspondent') return null;

  return <>{children}</>;
}