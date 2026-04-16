import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, FileImage, Users, UserPlus } from 'lucide-react';
import { api } from '@/hooks/useAuth';

interface DailyRendersData {
  data: Array<{ date: string; count: number }>;
  period_start: string;
  period_end: string;
}

interface PopularTemplate {
  template_id: string;
  template_name: string;
  render_count: number;
}

interface PopularTemplatesData {
  items: PopularTemplate[];
}

interface UserActivityData {
  new_users: Array<{ date: string; count: number }>;
  active_users: Array<{ date: string; count: number }>;
  period_start: string;
  period_end: string;
}

export const AdminStats = () => {
  const [rendersData, setRendersData] = useState<DailyRendersData | null>(null);
  const [popularTemplates, setPopularTemplates] = useState<PopularTemplate[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [rendersRes, popularRes, activityRes] = await Promise.all([
          api.get<DailyRendersData>(`/api/admin/stats/renders?days=${days}`),
          api.get<PopularTemplatesData>(`/api/admin/stats/popular-templates?days=${days}`),
          api.get<UserActivityData>(`/api/admin/stats/user-activity?days=${days}`),
        ]);
        setRendersData(rendersRes.data);
        setPopularTemplates(popularRes.data.items);
        setUserActivity(activityRes.data);
      } catch {
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [days]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  const maxRenders = Math.max(...(rendersData?.data.map((d) => d.count) || [0]));
  const maxNewUsers = Math.max(...(userActivity?.new_users.map((d) => d.count) || [0]));
  const maxActiveUsers = Math.max(...(userActivity?.active_users.map((d) => d.count) || [0]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
          <p className="text-muted-foreground mt-2">
            Application usage analytics
          </p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map((d) => (
            <Button
              key={d}
              variant={days === d ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDays(d)}
            >
              Last {d} days
            </Button>
          ))}
        </div>
      </div>

      {/* Daily Renders Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Daily Renders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end gap-2">
            {rendersData?.data.map((day, index) => {
              const height = maxRenders > 0 ? (day.count / maxRenders) * 100 : 0;
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full bg-primary rounded-t transition-all duration-300"
                    style={{ height: `${height}%`, minHeight: day.count > 0 ? 4 : 0 }}
                  />
                  <span className="text-xs text-muted-foreground rotate-0">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Popular Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Popular Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {popularTemplates.map((template, index) => (
              <div key={template.template_id} className="flex items-center gap-4">
                <div className="w-8 text-center font-bold text-muted-foreground">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{template.template_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {template.render_count} renders
                  </div>
                </div>
                <div className="w-32 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{
                      width: `${
                        popularTemplates[0]?.render_count
                          ? (template.render_count / popularTemplates[0].render_count) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {popularTemplates.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No renders in this period
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Activity Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* New Users Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              New Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-end gap-2">
              {userActivity?.new_users.map((day, index) => {
                const height = maxNewUsers > 0 ? (day.count / maxNewUsers) * 100 : 0;
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full bg-green-500 rounded-t transition-all duration-300"
                      style={{ height: `${height}%`, minHeight: day.count > 0 ? 4 : 0 }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Active Users Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-end gap-2">
              {userActivity?.active_users.map((day, index) => {
                const height = maxActiveUsers > 0 ? (day.count / maxActiveUsers) * 100 : 0;
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all duration-300"
                      style={{ height: `${height}%`, minHeight: day.count > 0 ? 4 : 0 }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminStats;
