import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, X, User, Mail, Calendar, Image as ImageIcon, Lock, Unlock } from 'lucide-react';
import { api } from '@/hooks/useAuth';

interface UserDetail {
  id: string;
  email: string;
  role: string;
  is_blocked: boolean;
  created_at: string;
  render_count: number;
  recent_renders: Array<{
    id: string;
    template_id: string;
    created_at: string;
    image_path: string;
  }>;
}

interface UserDetailsProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onBlockToggle: () => void;
}

export const UserDetails = ({ userId, isOpen, onClose, onBlockToggle }: UserDetailsProps) => {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockLoading, setBlockLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<UserDetail>(`/api/admin/users/${userId}`);
        setUser(response.data);
      } catch {
        setError('Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isOpen, userId]);

  const handleBlockToggle = async () => {
    if (!user) return;
    setBlockLoading(true);
    try {
      const action = user.is_blocked ? 'unblock' : 'block';
      await api.post(`/api/admin/users/${user.id}/${action}`);
      // Refresh user data
      const response = await api.get<UserDetail>(`/api/admin/users/${user.id}`);
      setUser(response.data);
      onBlockToggle();
    } catch {
      alert(`Failed to ${user.is_blocked ? 'unblock' : 'block'} user`);
    } finally {
      setBlockLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>User Details</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <Button variant="outline" className="mt-4" onClick={onClose}>
                Close
              </Button>
            </div>
          )}

          {!loading && !error && user && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Email</span>
                  </div>
                  <p className="font-medium">{user.email}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Joined</span>
                  </div>
                  <p className="font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Role & Status */}
              <div className="flex items-center gap-4">
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
                {user.is_blocked ? (
                  <Badge className="bg-red-100 text-red-800">Blocked</Badge>
                ) : (
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">{user.render_count}</div>
                  <div className="text-sm text-muted-foreground">Total Renders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{user.recent_renders.length}</div>
                  <div className="text-sm text-muted-foreground">Recent Renders</div>
                </div>
              </div>

              {/* Recent Renders */}
              {user.recent_renders.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Recent Renders
                  </h3>
                  <div className="space-y-2">
                    {user.recent_renders.map((render) => (
                      <div
                        key={render.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            Template: {render.template_id.slice(0, 8)}...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(render.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant={user.is_blocked ? 'outline' : 'destructive'}
                  onClick={handleBlockToggle}
                  disabled={blockLoading}
                  className="flex-1"
                >
                  {blockLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : user.is_blocked ? (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      Unblock User
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Block User
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetails;
