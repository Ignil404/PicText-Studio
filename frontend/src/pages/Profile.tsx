import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/ImageUpload';
import {
  LogOut,
  Mail,
  Calendar,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Profile = () => {
  const { user, sessionId, isLoading, isAuthenticated, logout } = useAuth();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfileImage();
    }
  }, [isAuthenticated]);

  const fetchProfileImage = async () => {
    setImageLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('/api/users/me/image', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(response.data);
      setProfileImageUrl(url);
    } catch {
      setProfileImageUrl(null);
    } finally {
      setImageLoading(false);
    }
  };

  const handleUploadComplete = (imageUrl: string) => {
    setProfileImageUrl(imageUrl);
  };

  const handleDeleteComplete = () => {
    setProfileImageUrl(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-60 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <Card className="text-center">
            <CardHeader>
              <div className="text-4xl mb-2">👤</div>
              <CardTitle>Гостевой режим</CardTitle>
              <CardDescription>
                Вы работаете без авторизации. Войдите для сохранения истории рендеров.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-3 font-mono text-sm">
                Session: {sessionId}
              </div>
              <Button asChild className="rounded-full">
                <Link to="/auth" state={{ redirectTo: '/' }}>
                  Войти или зарегистрироваться
                </Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">👤</span>
              Профиль
            </CardTitle>
            <CardDescription>Информация о вашем аккаунте</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!imageLoading && isAuthenticated && (
              <ImageUpload
                currentImageUrl={profileImageUrl}
                onUploadComplete={handleUploadComplete}
                onDeleteComplete={handleDeleteComplete}
              />
            )}

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Дата регистрации</p>
                <p className="font-medium">
                  {new Date(user.created_at).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Всего рендеров</p>
                  <p className="font-medium">{user.render_count}</p>
                </div>
              </div>
              <Badge variant="secondary">{user.render_count} шт.</Badge>
            </div>

            <Separator />

            <Button
              variant="outline"
              className="w-full rounded-full gap-2"
              onClick={logout}
              disabled={false}
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
