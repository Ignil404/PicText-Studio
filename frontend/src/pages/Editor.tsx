import { useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { templates } from '@/data/templates';
import { TextCustomization } from '@/types/template';
import { useSession } from '@/hooks/useAuth';
import Header from '@/components/Header';
import CanvasPreview from '@/components/CanvasPreview';
import EditorPanel from '@/components/EditorPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Editor = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const template = templates.find((t) => t.id === templateId);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { sessionId } = useSession();
  const { toast } = useToast();

  // Pre-fill with default text from template zones
  const [texts, setTexts] = useState<Record<string, string>>(() => {
    if (!template) return {};
    const d: Record<string, string> = {};
    template.textZones.forEach((z) => (d[z.id] = z.defaultText));
    return d;
  });
  const [customizations, setCustomizations] = useState<Record<string, TextCustomization>>({});
  const [customBackground, setCustomBackground] = useState<string | undefined>();
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);

  const handleTextChange = useCallback((zoneId: string, text: string) => {
    setTexts((prev) => ({ ...prev, [zoneId]: text }));
  }, []);

  const handleCustomizationChange = useCallback((zoneId: string, custom: TextCustomization) => {
    setCustomizations((prev) => ({ ...prev, [zoneId]: custom }));
  }, []);

  const handleDownload = useCallback((format: 'png' | 'jpeg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const quality = format === 'jpeg' ? 0.92 : undefined;
    const dataUrl = canvas.toDataURL(mimeType, quality);
    const link = document.createElement('a');
    link.download = `pictext-${template?.id || 'image'}.${format}`;
    link.href = dataUrl;
    link.click();
  }, [template]);

  const handleUploadBackground = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCustomBackground(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleServerRender = useCallback(async () => {
    if (!template) return;
    setRendering(true);
    try {
      const textBlocks = template.textZones.map((zone) => ({
        id: zone.id,
        text: texts[zone.id] || zone.defaultText,
        x: zone.x,
        y: zone.y,
        font_family: zone.fontFamily,
        font_size: zone.fontSize,
        color: zone.color,
        bold: zone.bold ?? false,
        italic: zone.italic ?? false,
        text_align: zone.align,
      }));

      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: template.backendId ?? template.id,
          text_blocks: textBlocks,
          session_id: sessionId,
          format: 'png',
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
        throw new Error(error.detail ?? `Render failed: ${res.status}`);
      }

      const data = await res.json();
      const link = document.createElement('a');
      link.href = data.image_url;
      link.download = `render-${template.id}.png`;
      link.click();

      toast({ title: '✅ Готово!', description: 'Картинка отрендерена на сервере и скачана' });
    } catch (err: any) {
      toast({ title: 'Ошибка рендера', description: err.message, variant: 'destructive' });
    } finally {
      setRendering(false);
    }
  }, [template, texts, sessionId, toast]);

  if (!template) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="text-center py-20">
          <p className="text-6xl mb-4">😕</p>
          <p className="text-muted-foreground text-lg mb-4">Шаблон не найден</p>
          <Link to="/">
            <Button className="rounded-full">← Вернуться к шаблонам</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Back button + title */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">{template.emoji}</span>
              {template.name}
            </h2>
          </div>
        </div>

        {/* Editor layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas preview */}
          <div className="lg:col-span-2">
            <CanvasPreview
              template={template}
              texts={texts}
              customizations={customizations}
              customBackground={customBackground}
              canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
            />
          </div>

          {/* Editor panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 bg-card rounded-2xl border-2 border-border p-5 shadow-lg">
              <EditorPanel
                template={template}
                texts={texts}
                customizations={customizations}
                onTextChange={handleTextChange}
                onCustomizationChange={handleCustomizationChange}
                onDownload={handleDownload}
                onUploadBackground={handleUploadBackground}
                onServerRender={handleServerRender}
                rendering={rendering}
                activeZone={activeZone}
                setActiveZone={setActiveZone}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Editor;
