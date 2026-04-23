import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function UserAvatar() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // or a placeholder spinner
  }

  const initials = user?.email?.charAt(0).toUpperCase() ?? 'U';

  return (
    <div className="absolute bottom-6 left-6 w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-lime-400 text-black font-bold">
      {user?.photoURL ? (
        <img src={user.photoURL} alt="User avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
