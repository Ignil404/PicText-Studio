import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/hooks/useAuth';

interface ShareButtonProps {
  templateId?: string;
  textBlocks?: Array<{
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
  sessionId?: string;
  renderHistoryId?: string;
}

export function ShareButton({ templateId, textBlocks = [], sessionId, renderHistoryId: initialRenderHistoryId }: ShareButtonProps) {
  const [renderHistoryId, setRenderHistoryId] = useState<string | undefined>(initialRenderHistoryId);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(window.location.origin + shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    let historyId = renderHistoryId;

    if (!historyId && templateId) {
      setLoading(true);
      try {
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
        historyId = data.render_history_id;
        setRenderHistoryId(historyId);
      } catch (err: unknown) {
        toast({
          title: 'Ошибка',
          description: err instanceof Error ? err.message : 'Не удалось создать рендер',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
    }

    if (!historyId) {
      toast({
        title: 'Сначала создайте рендер',
        description: 'Нажмите "Отрендерить и скачать" чтобы создать изображение',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/shared', {
        render_history_id: historyId,
      });
      const data = res.data;
      setShareUrl(data.url);
      toast({
        title: '✅ Ссылка создана!',
        description: 'Скопируйте ссылку и поделитесь ей',
      });
    } catch (err: unknown) {
      toast({
        title: 'Ошибка',
        description: err instanceof Error ? err.message : 'Не удалось создать ссылку',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleShare}
        disabled={loading}
        variant="outline"
        className="w-full rounded-xl font-bold gap-2"
      >
        <Share2 className="h-4 w-4" />
        {loading ? 'Создаю...' : shareUrl ? 'Копировать ссылку' : 'Поделиться'}
      </Button>
      {shareUrl && (
        <div className="flex gap-2">
          <Input
            value={`${window.location.origin}${shareUrl}`}
            readOnly
            className="text-xs"
          />
          <Button
            size="icon"
            variant="secondary"
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + shareUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}

export default ShareButton;