import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { api } from '@/hooks/useAuth';

interface SharedImageData {
  template_id: string;
  text_blocks: Array<{
    id: string;
    text: string;
    x: number;
    y: number;
    font_family: string;
    font_size: number;
    color: string;
    bold?: boolean;
    italic?: boolean;
    text_align?: string;
  }>;
  image_url: string;
  created_at: string;
}

const SharedImagePage = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [data, setData] = useState<SharedImageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSharedImage() {
      if (!shareId) {
        setError('Share ID not found');
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/api/shared/${shareId}`);
        setData(res.data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Image not found');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchSharedImage();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-8 text-center">
          <div className="bg-card rounded-2xl border-2 border-border p-8 shadow-lg">
            <p className="text-6xl mb-4">😕</p>
            <h2 className="text-2xl font-bold mb-2">Изображение не найдено</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link to="/">
              <Button className="rounded-full">← На главную</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-card rounded-2xl border-2 border-border p-6 shadow-lg">
          <div className="flex justify-center mb-6">
            <img
              src={data.image_url}
              alt="Shared image"
              className="max-w-full h-auto rounded-lg shadow-md"
            />
          </div>
          <div className="text-center space-y-4">
            <Link to="/">
              <Button className="rounded-full font-bold gap-2">
                ✨ Создать своё
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SharedImagePage;