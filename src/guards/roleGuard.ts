import { useAppSelector } from '@/hooks/redux';
import { UserRole } from '@/models/User';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useRoleGuard = (allowed: UserRole[]) => {
  const user = useAppSelector((s) => s.auth.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!allowed.includes(user.role)) {
      router.replace('/403');
    }
  }, [user, allowed, router]);
};
