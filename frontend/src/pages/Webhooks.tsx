import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { api } from '@/hooks/useAuth';

interface Webhook {
  id: string;
  url: string;
  event: string;
  is_active: boolean;
  created_at: string;
}

const Webhooks = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [newEvent, setNewEvent] = useState('render.created');

  const fetchWebhooks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/webhooks');
      setWebhooks(res.data.webhooks || []);
    } catch {
      setWebhooks([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const createWebhook = async () => {
    if (!newUrl.trim()) return;
    setLoading(true);
    try {
      await api.post('/api/webhooks', { url: newUrl, event: newEvent });
      setNewUrl('');
      await fetchWebhooks();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const deleteWebhook = async (id: string) => {
    setLoading(true);
    try {
      await api.delete(`/api/webhooks/${id}`);
      await fetchWebhooks();
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const testWebhook = async (id: string) => {
    try {
      await api.post(`/api/webhooks/${id}/test`);
      alert('Test sent!');
    } catch {
      alert('Test failed');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Webhooks</h1>

        <div className="border rounded-xl p-4 mb-6">
          <h2 className="font-bold mb-3">Add Webhook</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="url"
              placeholder="https://..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="flex-1 p-2 border rounded-lg"
            />
            <select
              value={newEvent}
              onChange={(e) => setNewEvent(e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="render.created">Render Created</option>
              <option value="render.shared">Render Shared</option>
            </select>
          </div>
          <button
            onClick={createWebhook}
            disabled={loading || !newUrl.trim()}
            className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-bold"
          >
            Add Webhook
          </button>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : webhooks.length === 0 ? (
          <p className="text-muted-foreground">No webhooks configured</p>
        ) : (
          <div className="space-y-3">
            {webhooks.map((wh) => (
              <div key={wh.id} className="flex items-center justify-between p-4 border rounded-xl">
                <div>
                  <p className="font-bold text-sm">{wh.url}</p>
                  <p className="text-muted-foreground text-sm">
                    {wh.event} · {new Date(wh.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => testWebhook(wh.id)}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Test
                  </button>
                  <button
                    onClick={() => deleteWebhook(wh.id)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Webhooks;