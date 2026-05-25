"use client";
// Account/Profile Page
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAccount } from '../../../hooks/useAccount';

export default function AccountProfile() {
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data?.user?.id || null));
  }, []);
  const { profile, loading, error } = useAccount(userId || '');

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Account / Profile</h1>
      <div className="card p-6 mb-8">
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {profile && (
          <>
            <div className="flex items-center gap-6 mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center text-2xl font-bold">
                {profile.name ? profile.name.split(' ').map(n => n[0]).join('') : '?'}
              </div>
              <div>
                <div className="font-semibold">{profile.name}</div>
                <div className="text-gray-500">{profile.email}</div>
              </div>
            </div>
            <div className="card p-4 mb-4">Plan: {profile.plan} <span className="badge bg-green-100 text-green-700 ml-2">Active</span></div>
            <div className="card p-4 mb-4">Quota Usage: {profile.quota}%</div>
            <div className="card p-4">Settings Links</div>
          </>
        )}
      </div>
    </div>
  );
}