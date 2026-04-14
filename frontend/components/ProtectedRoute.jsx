'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, isProfileComplete } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (!isProfileComplete && pathname !== '/complete-profile') {
      router.replace('/complete-profile');
      return;
    }
    if (isProfileComplete && pathname === '/complete-profile') {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, loading, isProfileComplete, pathname, router]);

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(239,62,66,0.1)', borderTopColor: '#EF3E42', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated || (!isProfileComplete && pathname !== '/complete-profile')) return null;

  return children;
};
