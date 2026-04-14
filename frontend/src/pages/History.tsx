import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { useAuth, api } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Download } from 'lucide-react';

interface HistoryEntry {
  id: string;
  template_id: string;
  template_name: string;
  text_blocks: Array<{ id: string; text: string }>;
  image_url: string;
  created_at: string;
}

const History = () => {
  const { sessionId, isLoading, isAuthenticated } = useAuth();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    const params = new URLSearchParams();
    if (!isAuthenticated && sessionId) {
      params.set('session_id', sessionId);
    }
    const query = params.toString();
    const url = '/api/history/me' + (query ? '?' + query : '');

    api
      .get(url)
      .then((res) => {
        setEntries(res.data);
        setFetching(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to fetch history');
        setFetching(false);
      });
  }, [sessionId, isLoading, isAuthenticated]);

  const displayId = isAuthenticated ? 'авторизован' : sessionId;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold">📜 История рендеров</h2>
            <p className="text-sm text-muted-foreground font-mono">{displayId}</p>
          </div>
        </div>

        {fetching ? (
          <div className="text-center py-20 text-muted-foreground">Загрузка...</div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">⚠️</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border-2 border-border">
            <p className="text-4xl mb-3">🎨</p>
            <p className="text-muted-foreground mb-4">Пока нет рендеров в этой сессии</p>
            <Link to="/">
              <Button className="rounded-full">Создать первую!</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="overflow-hidden border-2 border-border shadow-md">
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={entry.image_url}
                    alt={entry.template_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">{entry.template_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString('ru')}
                      </p>
                    </div>
                    <a href={entry.image_url} download>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
