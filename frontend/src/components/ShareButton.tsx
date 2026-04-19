import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ShareModal from './ShareModal';

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

export function ShareButton({ templateId, textBlocks = [], sessionId, renderHistoryId }: ShareButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  const handleOpen = () => {
    if (!templateId) {
      toast({
        title: 'Сначала выберите шаблон',
        variant: 'destructive',
      });
      return;
    }
    setModalOpen(true);
  };

  return (
    <>
      <div className="space-y-2">
        <Button
          onClick={handleOpen}
          variant="outline"
          className="w-full rounded-xl font-bold gap-2"
        >
          <Share2 className="h-4 w-4" />
          Поделиться
        </Button>
      </div>

      <ShareModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        templateId={templateId}
        textBlocks={textBlocks}
        sessionId={sessionId}
        renderHistoryId={renderHistoryId}
      />
    </>
  );
}

export default ShareButton;