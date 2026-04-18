import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Lock, Unlock, Eye } from 'lucide-react';
import { UserDetails } from '@/components/admin/UserDetails';
import { api } from '@/hooks/useAuth';

interface User {
  id: string;
  email: string;
  role: string;
  is_blocked: boolean;
  created_at: string;
  avatar_url?: string;
}

interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  page_size: number;
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get<UserListResponse>('/api/admin/users');
        setUsers(response.data.items);
      } catch {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleBlock = async (userId: string, block: boolean) => {
    try {
      await api.post(`/api/admin/users/${userId}/${block ? 'block' : 'unblock'}`);
      // Refresh the list
      const response = await api.get<UserListResponse>('/api/admin/users');
      setUsers(response.data.items);
    } catch {
      alert(`Failed to ${block ? 'block' : 'unblock'} user`);
    }
  };

  const handleViewDetails = (userId: string) => {
    setSelectedUserId(userId);
    setDetailsOpen(true);
  };

  const handleDetailsBlockToggle = async () => {
    // Refresh the list after block/unblock from details
    const response = await api.get<UserListResponse>('/api/admin/users');
    setUsers(response.data.items);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading users...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block mb-4">
          {error}
        </div>
        <div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Users</h1>
        <p className="text-slate-500 mt-2">
          Manage registered users and their access
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-11 max-w-md border-slate-200"
        />
      </div>

      {/* User Details Modal */}
      <UserDetails
        userId={selectedUserId}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onBlockToggle={handleDetailsBlockToggle}
      />

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Users ({filteredUsers.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Email</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Role</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Created</th>
                <th className="text-right py-3 px-6 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm">
                          👤
                        </div>
                      )}
                      <span className="text-slate-900">{user.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {user.is_blocked ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Blocked
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-slate-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetails(user.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleBlock(user.id, !user.is_blocked)}
                      >
                        {user.is_blocked ? (
                          <Unlock className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-orange-500" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
