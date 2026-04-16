import { useEffect, useState } from 'react';
import { Loader2, Image, Users, FileImage, Activity } from 'lucide-react';
import { api } from '@/hooks/useAuth';

interface DashboardStats {
  renders_last_7d: number;
  total_users: number;
  total_templates: number;
  renders_today: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get<DashboardStats>('/api/admin/stats/dashboard');
        setStats(response.data);
      } catch {
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading dashboard...</span>
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

  const statCards = [
    {
      title: 'Renders (7 days)',
      value: stats?.renders_last_7d ?? 0,
      icon: <Activity className="h-6 w-6" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Users',
      value: stats?.total_users ?? 0,
      icon: <Users className="h-6 w-6" />,
      color: 'bg-emerald-500',
    },
    {
      title: 'Total Templates',
      value: stats?.total_templates ?? 0,
      icon: <FileImage className="h-6 w-6" />,
      color: 'bg-violet-500',
    },
    {
      title: 'Renders Today',
      value: stats?.renders_today ?? 0,
      icon: <Image className="h-6 w-6" />,
      color: 'bg-amber-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-2">
          Overview of your application statistics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{card.value.toLocaleString()}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.color}`}>
                <div className="text-white">{card.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <button
          className="text-left p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-300 transition-all"
          onClick={() => window.location.href = '/admin/templates'}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FileImage className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Manage Templates</h3>
              <p className="text-sm text-slate-500 mt-1">
                Create, edit, and manage image templates
              </p>
            </div>
          </div>
        </button>
        <button
          className="text-left p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-300 transition-all"
          onClick={() => window.location.href = '/admin/users'}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Manage Users</h3>
              <p className="text-sm text-slate-500 mt-1">
                View and manage registered users
              </p>
            </div>
          </div>
        </button>
        <button
          className="text-left p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-300 transition-all"
          onClick={() => window.location.href = '/admin/stats'}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Activity className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">View Statistics</h3>
              <p className="text-sm text-slate-500 mt-1">
                Detailed analytics and usage statistics
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
