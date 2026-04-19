import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';

const SharedImage = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('saved_images')
        .select('image_url')
        .eq('share_id', shareId)
        .eq('is_public', true)
        .maybeSingle();
      setImageUrl(data?.image_url || null);
      setLoading(false);
    };
    fetch();
  }, [shareId]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8 text-center">
        {loading ? (
          <p className="text-muted-foreground py-20">Загрузка...</p>
        ) : imageUrl ? (
          <div>
            <img src={imageUrl} alt="Shared" className="rounded-2xl shadow-lg mx-auto max-w-full" />
            <div className="mt-6">
              <Link to="/">
                <Button className="rounded-full">🎨 Создать свою картинку</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="py-20">
            <p className="text-4xl mb-4">😕</p>
            <p className="text-muted-foreground mb-4">Картинка не найдена или не является публичной</p>
            <Link to="/">
              <Button className="rounded-full">← На главную</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default SharedImage;
