'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Badge from '@/components/ui/Badge';

export default function AdminUsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => { if (data) setUsers(data); });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading mb-6">Users</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gold-50 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-50 text-xs text-muted">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Phone</th>
              <th className="text-left px-4 py-3">City</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gold-50 last:border-0">
                <td className="px-4 py-3 font-medium">{u.first_name} {u.last_name}</td>
                <td className="px-4 py-3 text-muted">{u.phone || '-'}</td>
                <td className="px-4 py-3 text-muted">{u.city || '-'}</td>
                <td className="px-4 py-3"><Badge color={u.role === 'admin' ? 'gold' : 'gray'}>{u.role}</Badge></td>
                <td className="px-4 py-3 text-xs text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
