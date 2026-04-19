import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Trash2, ExternalLink, Globe, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SavedImage {
  id: string;
  template_id: string;
  image_url: string;
  is_public: boolean;
  share_id: string | null;
  created_at: string;
}

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [images, setImages] = useState<SavedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchImages = async () => {
      const { data } = await supabase
        .from('saved_images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setImages(data || []);
      setLoading(false);
    };
    fetchImages();
  }, [user]);

  const handleDelete = async (id: string) => {
    await supabase.from('saved_images').delete().eq('id', id);
    setImages((prev) => prev.filter((img) => img.id !== id));
    toast({ title: '🗑️ Удалено' });
  };

  const togglePublic = async (id: string, current: boolean) => {
    await supabase.from('saved_images').update({ is_public: !current }).eq('id', id);
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, is_public: !current } : img)));
    toast({ title: !current ? '🌍 Доступно по ссылке' : '🔒 Скрыто' });
  };

  const copyShareLink = (shareId: string) => {
    const url = `${window.location.origin}/shared/${shareId}`;
    navigator.clipboard.writeText(url);
    toast({ title: '📋 Ссылка скопирована!' });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="text-center py-20 text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">👤 Мой профиль</h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" className="rounded-full" onClick={signOut}>
            Выйти
          </Button>
        </div>

        <h3 className="text-xl font-bold mb-4">🖼️ Мои картинки ({images.length})</h3>

        {images.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border-2 border-border">
            <p className="text-4xl mb-3">🎨</p>
            <p className="text-muted-foreground mb-4">Пока нет сохранённых картинок</p>
            <Link to="/">
              <Button className="rounded-full">Создать первую!</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((img) => (
              <div key={img.id} className="bg-card rounded-2xl border-2 border-border overflow-hidden shadow-md group">
                <img
                  src={img.image_url}
                  alt="Saved"
                  className="w-full aspect-video object-cover"
                />
                <div className="p-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(img.created_at).toLocaleDateString('ru')}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => togglePublic(img.id, img.is_public)}
                      title={img.is_public ? 'Сделать приватной' : 'Сделать публичной'}
                    >
                      {img.is_public ? <Globe className="h-4 w-4 text-green-500" /> : <Lock className="h-4 w-4" />}
                    </Button>
                    {img.is_public && img.share_id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyShareLink(img.share_id!)}
                        title="Копировать ссылку"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(img.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
