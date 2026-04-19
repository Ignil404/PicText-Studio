import { useState } from 'react';
import Header from '@/components/Header';
import { api } from '@/hooks/useAuth';

const ApiDocs = () => {
  const [apiKeys, setApiKeys] = useState<Array<{id: string; name: string; key: string; rate_limit: number}>>([]);
  const [loading, setLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/keys');
      setApiKeys(res.data.keys || []);
    } catch {
      setApiKeys([]);
    }
    setLoading(false);
  };

  const createKey = async () => {
    if (!newKeyName.trim()) return;
    setLoading(true);
    try {
      await api.post('/api/keys', { name: newKeyName, rate_limit: 100 });
      setNewKeyName('');
      await fetchKeys();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const deleteKey = async (keyId: string) => {
    setLoading(true);
    try {
      await api.delete(`/api/keys/${keyId}`);
      await fetchKeys();
    } catch {
      // ignore
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">API Documentation</h1>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Getting Started</h2>
          <p className="text-muted-foreground mb-4">
            To use the PicText API, you'll need an API key. Create one below.
          </p>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Key name..."
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1 p-2 border rounded-lg"
            />
            <button
              onClick={createKey}
              disabled={loading || !newKeyName.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold"
            >
              Create Key
            </button>
            <button
              onClick={fetchKeys}
              className="px-4 py-2 border rounded-lg"
            >
              Refresh
            </button>
          </div>

          {apiKeys.length > 0 && (
            <div className="space-y-2">
              {apiKeys.map((k) => (
                <div key={k.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-bold">{k.name}</span>
                    <span className="ml-2 text-muted-foreground text-sm">
                      {k.key} (limit: {k.rate_limit}/min)
                    </span>
                  </div>
                  <button
                    onClick={() => deleteKey(k.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Rendering</h2>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`POST /api/v1/render
X-API-Key: pt_your_api_key_here

{
  "template_id": "uuid",
  "text_blocks": [
    {
      "id": "zone1",
      "text": "Hello",
      "x": 0.5,
      "y": 0.5,
      "font_family": "Roboto",
      "font_size": 48,
      "color": "#ffffff"
    }
  ],
  "format": "png",
  "quality": 85,
  "resolution": "hd"
}`}
          </pre>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Response</h2>
          <pre className="bg-muted p-4 rounded-lg text-sm">
{`{
  "image_url": "/api/rendered/abc123.png",
  "render_history_id": "uuid"
}`}
          </pre>
        </section>
      </main>
    </div>
  );
};

export default ApiDocs;