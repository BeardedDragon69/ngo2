'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // First check if token exists
        if (!authService.isAuthenticated()) {
          router.push('/login');
          return;
        }

        // Decode token to check if admin
        const payload = authService.getTokenPayload();
        
        // If we can't decode the token or user is not admin, redirect
        if (!payload) {
          authService.logout();
          router.push('/login');
          return;
        }
        
        // Check if user is admin
        // Note: This depends on your token payload containing role/admin information
        // Alternatively, you can make an API call to check admin status
        
        // For now, we'll assume the token payload has an 'is_admin' field
        // In a real app, you might need to fetch the user profile
        
        // Mock check - replace with actual check based on your token
        const isUserAdmin = true; // payload.is_admin;
        
        if (!isUserAdmin) {
          router.push('/');
          return;
        }
        
        // If we get here, user is authenticated and is an admin
        setIsAdmin(true);
      } catch (error) {
        console.error('Error verifying admin status:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="admin-loading">Verifying admin access...</div>;
  }

  // If not admin, don't render anything (redirect should happen)
  if (!isAdmin) {
    return null;
  }

  // If admin, render the admin pages
  return (
    <div className="admin-layout">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button 
          onClick={() => {
            authService.logout();
            router.push('/login');
          }}
          className="logout-button"
        >
          Logout
        </button>
      </div>
      <div className="admin-content">
        {children}
      </div>
      
      <style jsx>{`
        .admin-layout {
          min-height: 100vh;
        }
        
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: rgba(15, 23, 42, 0.9);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .admin-header h1 {
          color: #ffffff;
          margin: 0;
        }
        
        .logout-button {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          cursor: pointer;
        }
        
        .logout-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .admin-content {
          padding: 1rem;
        }
        
        .admin-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 1.2rem;
          color: white;
        }
      `}</style>
    </div>
  );
} 