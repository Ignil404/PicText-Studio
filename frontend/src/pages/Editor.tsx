import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { templates as localTemplates } from '@/data/templates';
import { Template, TextCustomization } from '@/types/template';
import { useSession } from '@/hooks/useAuth';
import Header from '@/components/Header';
import CanvasPreview from '@/components/CanvasPreview';
import EditorPanel from '@/components/EditorPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchTemplateById, mergeTemplates } from '@/api/client';

const Editor = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { sessionId } = useSession();
  const { toast } = useToast();

  // Fetch template from backend, fall back to local data
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTemplate() {
      if (!templateId) {
        setLoading(false);
        return;
      }

      // Try backend first
      try {
        const backendData = await fetchTemplateById(templateId);
        if (!cancelled) {
          if (backendData) {
            // Merge with local data for full enrichment
            const merged = mergeTemplates([backendData], localTemplates);
            setTemplate(merged[0] || null);
          } else {
            // Not in backend, try local only
            const local = localTemplates.find(
              (t) => t.id === templateId || t.backendId === templateId,
            );
            setTemplate(local || null);
          }
        }
      } catch {
        if (!cancelled) {
          // Backend unavailable, fall back to local
          const local = localTemplates.find(
            (t) => t.id === templateId || t.backendId === templateId,
          );
          setTemplate(local || null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTemplate();
    return () => {
      cancelled = true;
    };
  }, [templateId]);

  // Pre-fill with default text from template zones
  const [texts, setTexts] = useState<Record<string, string>>(() => ({}));
  const [customizations, setCustomizations] = useState<Record<string, TextCustomization>>({});
  const [customBackground, setCustomBackground] = useState<string | undefined>();
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);

  // Refs for async callbacks to avoid stale closures
  const templateRef = useRef<Template | null>(template);
  const textsRef = useRef(texts);
  useEffect(() => { templateRef.current = template; }, [template]);
  useEffect(() => { textsRef.current = texts; }, [texts]);

  // Initialize texts when template loads
  useEffect(() => {
    if (template) {
      const d: Record<string, string> = {};
      template.textZones.forEach((z) => (d[z.id] = z.defaultText));
      setTexts(d);
    }
  }, [template]);

  const handleTextChange = useCallback((zoneId: string, text: string) => {
    setTexts((prev) => ({ ...prev, [zoneId]: text }));
  }, []);

  const handleCustomizationChange = useCallback(
    (zoneId: string, custom: TextCustomization) => {
      setCustomizations((prev) => ({ ...prev, [zoneId]: custom }));
    },
    [],
  );

  const handleDownload = useCallback(
    (format: 'png' | 'jpeg') => {
      const canvas = canvasRef.current;
      const tpl = templateRef.current;
      if (!canvas) return;
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const quality = format === 'jpeg' ? 0.92 : undefined;
      const dataUrl = canvas.toDataURL(mimeType, quality);
      const link = document.createElement('a');
      link.download = `pictext-${tpl?.id || 'image'}.${format}`;
      link.href = dataUrl;
      link.click();
    },
    [],
  );

  const handleUploadBackground = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCustomBackground(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleServerRender = useCallback(async () => {
    const tpl = templateRef.current;
    const txt = textsRef.current;
    if (!tpl) return;
    setRendering(true);
    try {
      const textBlocks = tpl.textZones.map((zone) => ({
        id: zone.id,
        text: txt[zone.id] || zone.defaultText,
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
          template_id: tpl.backendId ?? tpl.id,
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
      link.download = `render-${tpl.id}.png`;
      link.click();

      toast({
        title: '✅ Готово!',
        description: 'Картинка отрендерена на сервере и скачана',
      });
    } catch (err: any) {
      toast({
        title: 'Ошибка рендера',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setRendering(false);
    }
  }, [sessionId, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
