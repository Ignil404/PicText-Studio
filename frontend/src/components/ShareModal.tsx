import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Copy, Check, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/hooks/useAuth';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  templateId?: string;
  textBlocks?: Array<{
    id: string;
    text: string;
    x: number;
    y: number;
    font_family: string;
    font_size: number;
    color: string;
  }>;
  sessionId?: string;
  renderHistoryId?: string;
}

const SOCIAL_BUTTONS = [
  {
    id: 'telegram',
    label: 'Telegram',
    icon: '✈️',
    color: '#0088cc',
    getUrl: (url: string, text: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: 'vk',
    label: 'VK',
    icon: '💜',
    color: '#4a76a8',
    getUrl: (url: string, text: string) =>
      `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: '💬',
    color: '#25d366',
    getUrl: (url: string, text: string) =>
      `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
  },
  {
    id: 'twitter',
    label: 'X',
    icon: '🐦',
    color: '#000000',
    getUrl: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
];

export function ShareModal({ open, onClose, templateId, textBlocks = [], sessionId, renderHistoryId: initialRenderHistoryId }: ShareModalProps) {
  const [renderHistoryId, setRenderHistoryId] = useState<string | null>(initialRenderHistoryId || null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const fullUrl = shareUrl ? window.location.origin + shareUrl : '';
  const shareText = 'Создал картинку в PicText';

  useEffect(() => {
    if (open && !shareUrl && !loading) {
      if (initialRenderHistoryId) {
        createShareLink(initialRenderHistoryId);
      } else if (templateId) {
        createShareLink(null);
      }
    }
  }, [open]);

  const createShareLink = async (existingHistoryId: string | null) => {
    if (!templateId && !existingHistoryId) return;
    setLoading(true);
    setError(null);
    try {
      let historyId = existingHistoryId;

      if (!historyId && templateId) {
        console.log('Creating render for template:', templateId);
        const body: Record<string, unknown> = {
          template_id: templateId,
          text_blocks: textBlocks,
          format: 'png',
        };
        if (sessionId && sessionId.trim()) {
          body.session_id = sessionId;
        }

        const res = await api.post('/api/render', body);
        const data = res.data;
        console.log('Render response:', data);
        historyId = data.render_history_id;
        setRenderHistoryId(historyId);
      }

      if (!historyId) {
        setError('Не удалось создать рендер');
        setLoading(false);
        return;
      }

      console.log('Creating share for history:', historyId);
      const shareRes = await api.post('/api/shared', { render_history_id: historyId });
      const shareData = shareRes.data;
      console.log('Share response:', shareData);
      setShareUrl(shareData.url);
    } catch (err: unknown) {
      console.error('Share error:', err);
      const msg = err instanceof Error ? err.message : 'Ошибка';
      setError(msg);
      toast({
        title: 'Ошибка',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (social: typeof SOCIAL_BUTTONS[0]) => {
    if (!fullUrl) return;
    const url = social.getUrl(fullUrl, shareText);
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleWebShare = async () => {
    if (!navigator.share || !fullUrl) return;
    try {
      await navigator.share({
        title: 'PicText',
        text: shareText,
        url: fullUrl,
      });
    } catch (err) {
      // User cancelled or error
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-2xl w-full max-w-sm p-4 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Поделиться</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Создаю ссылку...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-2">{error}</p>
            <Button onClick={() => createShareLink(null)} variant="outline">
              Попробовать снова
            </Button>
          </div>
        ) : shareUrl ? (
          <>
            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {SOCIAL_BUTTONS.map((social) => (
                <Button
                  key={social.id}
                  onClick={() => handleShare(social)}
                  className="rounded-xl font-bold gap-2"
                  style={{ backgroundColor: social.color }}
                >
                  <span>{social.icon}</span>
                  {social.label}
                </Button>
              ))}
            </div>

            {/* Web Share API */}
            {'share' in navigator && (
              <Button
                onClick={handleWebShare}
                variant="outline"
                className="w-full rounded-xl font-bold gap-2 mb-4"
              >
                <Send className="h-4 w-4" />
                Ещё...
              </Button>
            )}

            {/* Copy link */}
            <div className="flex gap-2">
              <input
                value={fullUrl}
                readOnly
                className="flex-1 px-3 py-2 rounded-lg bg-muted text-sm"
              />
              <Button size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Не удалось создать ссылку</p>
            <Button onClick={createShareLink} variant="outline" className="mt-4">
              Попробовать снова
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShareModal;