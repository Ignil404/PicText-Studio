import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { templates as localTemplates } from '@/data/templates';
import { Template, TextCustomization } from '@/types/template';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import CanvasPreview from '@/components/CanvasPreview';
import EditorPanel from '@/components/EditorPanel';
import { ExportModal } from '@/components/ExportModal';
import StickerPicker from '@/components/StickerPicker';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Loader2, Smile, Square, Circle, Minus, ArrowRight, Type } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchTemplateById, mergeTemplates } from '@/api/client';
import { api } from '@/hooks/useAuth';
import { StickerBlock, ShapeBlock } from '@/shared/types';

const Editor = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const { sessionId, isAuthenticated } = useAuth();
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
  const [renderHistoryId, setRenderHistoryId] = useState<string | undefined>();
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Stickers and shapes state
  const [stickerBlocks, setStickerBlocks] = useState<StickerBlock[]>([]);
  const [shapeBlocks, setShapeBlocks] = useState<ShapeBlock[]>([]);
  const [activeTool, setActiveTool] = useState<'text' | 'sticker' | 'shape' | 'filter'>('text');
  const [shapeType, setShapeType] = useState<'rectangle' | 'circle' | 'line' | 'arrow'>('rectangle');
  const [shapeColor, setShapeColor] = useState('#000000');
  const [shapeFilled, setShapeFilled] = useState(false);
  const [shapeStroke, setShapeStroke] = useState(2);

  // Build text blocks for sharing
  const textBlocks = template?.textZones.map((zone) => ({
    id: zone.id,
    text: texts[zone.id] || zone.defaultText,
    x: zone.x,
    y: zone.y,
    font_family: zone.fontFamily,
    font_size: zone.fontSize,
    color: (customizations[zone.id]?.color) || zone.color,
    bold: zone.bold ?? false,
    italic: zone.italic ?? false,
    text_align: zone.align,
  })) || [];

  // Refs for async callbacks to avoid stale closures
  const templateRef = useRef<Template | null>(template);
  const textsRef = useRef(texts);
  const customizationsRef = useRef(customizations);
  const stickerBlocksRef = useRef(stickerBlocks);
  const shapeBlocksRef = useRef(shapeBlocks);
  useEffect(() => { templateRef.current = template; }, [template]);
  useEffect(() => { textsRef.current = texts; }, [texts]);
  useEffect(() => { customizationsRef.current = customizations; }, [customizations]);
  useEffect(() => { stickerBlocksRef.current = stickerBlocks; }, [stickerBlocks]);
  useEffect(() => { shapeBlocksRef.current = shapeBlocks; }, [shapeBlocks]);

  // Add sticker to canvas
  const addSticker = useCallback((emoji: string) => {
    const newSticker: StickerBlock = {
      id: `sticker-${Date.now()}`,
      emoji,
      x: 0.5,
      y: 0.5,
      size: 48,
    };
    setStickerBlocks((prev) => [...prev, newSticker]);
  }, []);

  // Remove sticker from canvas
  const removeSticker = useCallback((id: string) => {
    setStickerBlocks((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Add shape to canvas
  const addShape = useCallback(() => {
    const newShape: ShapeBlock = {
      id: `shape-${Date.now()}`,
      type: shapeType,
      x: 0.1,
      y: 0.1,
      width: 0.3,
      height: shapeType === 'line' || shapeType === 'arrow' ? 0.2 : 0.2,
      color: shapeColor,
      filled: shapeFilled,
      strokeWidth: shapeStroke,
    };
    setShapeBlocks((prev) => [...prev, newShape]);
  }, [shapeType, shapeColor, shapeFilled, shapeStroke]);

  // Remove shape from canvas
  const removeShape = useCallback((id: string) => {
    setShapeBlocks((prev) => prev.filter((s) => s.id !== id));
  }, []);

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

  const handleServerRender = useCallback(async (options?: unknown) => {
    const tpl = templateRef.current;
    const txt = textsRef.current;
    const cust = customizationsRef.current;
    const stickers = stickerBlocksRef.current;
    const shapes = shapeBlocksRef.current;
    if (!tpl) return;
    setRendering(true);
    try {
      const textBlocks = tpl.textZones.map((zone) => {
        const custom = cust[zone.id] || {};
        return {
          id: zone.id,
          text: txt[zone.id] || zone.defaultText,
          x: zone.x,
          y: zone.y,
          font_family: custom.fontFamily || zone.fontFamily,
          font_size: custom.fontSize || zone.fontSize,
          color: custom.color || zone.color,
          bold: zone.bold ?? false,
          italic: zone.italic ?? false,
          text_align: zone.align,
          shadow: zone.shadow ?? false,
          stroke_color: zone.strokeColor,
          stroke_width: zone.strokeWidth ?? 2,
          max_width: zone.maxWidth ?? 0.8,
        };
      });

      const qualityMap: Record<string, number> = { low: 50, medium: 70, high: 85, lossless: 100 };
      const format = options?.format || 'png';
      const quality = options ? qualityMap[options.quality] : 85;
      const resolution = options?.resolution || 'hd';

      const body: Record<string, unknown> = {
        template_id: tpl.backendId ?? tpl.id,
        text_blocks: textBlocks,
        sticker_blocks: stickers,
        shape_blocks: shapes,
        format,
        quality,
        resolution,
      };
      if (!isAuthenticated) {
        body.session_id = sessionId;
      }

      const res = await api.post('/api/render', body);
      const data = res.data;
      if (data.render_history_id) {
        setRenderHistoryId(data.render_history_id);
      }
      const link = document.createElement('a');
      link.href = data.image_url;
      link.download = `render-${tpl.id}.${format === 'jpeg' ? 'jpg' : format}`;
      link.click();

      toast({
        title: '✅ Готово!',
        description: 'Картинка отрендерена на сервере и скачана',
      });
    } catch (err: unknown) {
      toast({
        title: 'Ошибка рендера',
        description: err instanceof Error ? err.message : 'Render failed',
        variant: 'destructive',
      });
    } finally {
      setRendering(false);
    }
  }, [sessionId, isAuthenticated, toast]);

  const handleExportClient = useCallback(
    (options: unknown) => {
      const canvas = canvasRef.current;
      const tpl = templateRef.current;
      if (!canvas) return;
      const mimeMap: Record<string, string> = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' };
      const qualityMap: Record<string, number> = { low: 0.5, medium: 0.7, high: 0.85, lossless: 1 };
      const format = options.format;
      const mimeType = mimeMap[format] || 'image/png';
      const quality = format === 'png' ? undefined : qualityMap[options.quality];
      const dataUrl = canvas.toDataURL(mimeType, quality);
      const link = document.createElement('a');
      link.download = `pictext-${tpl?.id || 'image'}.${format === 'jpeg' ? 'jpg' : format}`;
      link.href = dataUrl;
      link.click();
    },
    [],
  );

  const handleExportZip = useCallback(
    async (options: unknown & { zipFormats?: string[] }) => {
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

        const qualityMap: Record<string, number> = { low: 50, medium: 70, high: 85, lossless: 100 };
        const resolution = options.resolution || 'hd';

        const body: Record<string, unknown> = {
          template_id: tpl.backendId ?? tpl.id,
          text_blocks: textBlocks,
          formats: options.zipFormats || ['png'],
          quality: qualityMap[options.quality],
          resolution,
        };
        if (!isAuthenticated) {
          body.session_id = sessionId;
        }

        const res = await api.post('/api/export-zip', body);
        const data = res.data;
        const link = document.createElement('a');
        link.href = data.download_url;
        link.download = `pictext-export.zip`;
        link.click();

        toast({
          title: '✅ Готово!',
          description: 'ZIP архив скачан',
        });
      } catch (err: unknown) {
        toast({
          title: 'Ошибка',
          description: err instanceof Error ? err.message : 'Export failed',
          variant: 'destructive',
        });
      } finally {
        setRendering(false);
      }
    },
    [sessionId, isAuthenticated, toast],
  );

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
              stickerBlocks={stickerBlocks}
              shapeBlocks={shapeBlocks}
              canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
            />
          </div>

          {/* Tools toolbar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Tool selector */}
              <div className="bg-card rounded-2xl border-2 border-border p-4 shadow-lg">
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={activeTool === 'text' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTool('text')}
                    className="flex-1"
                  >
                    <Type className="h-4 w-4 mr-1" />Текст
                  </Button>
                  <Button
                    variant={activeTool === 'sticker' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTool('sticker')}
                    className="flex-1"
                  >
                    <Smile className="h-4 w-4 mr-1" />Стикер
                  </Button>
                  <Button
                    variant={activeTool === 'shape' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTool('shape')}
                    className="flex-1"
                  >
                    <Square className="h-4 w-4 mr-1" />Фигура
                  </Button>
                </div>

                {/* Shape tools - visible when shape tool active */}
                {activeTool === 'shape' && (
                  <div className="space-y-3 pt-3 border-t border-border">
                    <div className="grid grid-cols-4 gap-2">
                      <Button
                        variant={shapeType === 'rectangle' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShapeType('rectangle')}
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={shapeType === 'circle' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShapeType('circle')}
                      >
                        <Circle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={shapeType === 'line' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShapeType('line')}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={shapeType === 'arrow' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShapeType('arrow')}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={shapeColor}
                        onChange={(e) => setShapeColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer"
                      />
                      <Button
                        variant={shapeFilled ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShapeFilled(!shapeFilled)}
                        className="flex-1"
                      >
                        {shapeFilled ? 'Заполнено' : 'Контур'}
                      </Button>
                      <Button size="sm" onClick={addShape} className="flex-1">
                        + Добавить
                      </Button>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Толщина: {shapeStroke}px
                      </Label>
                      <Slider
                        value={[shapeStroke]}
                        onValueChange={([val]) => setShapeStroke(val)}
                        min={1}
                        max={10}
                        step={1}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {/* Stickers picker - visible when sticker tool active */}
                {activeTool === 'sticker' && (
                  <div className="bg-card rounded-2xl border-2 border-border p-4 shadow-lg">
                    <StickerPicker onSelect={addSticker} />
                    {stickerBlocks.length > 0 && (
                      <div className="pt-3 mt-3 border-t border-border">
                        <Label className="text-xs text-muted-foreground mb-2 block">
                          Добавленные стикеры
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {stickerBlocks.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => removeSticker(s.id)}
                              className="text-2xl hover:bg-muted rounded-lg p-1"
                              title="Удалить"
                            >
                              {s.emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Editor panel */}
              <div className="bg-card rounded-2xl border-2 border-border p-5 shadow-lg">
                <EditorPanel
                template={template}
                texts={texts}
                customizations={customizations}
                onTextChange={handleTextChange}
                onCustomizationChange={handleCustomizationChange}
                onDownload={() => setExportModalOpen(true)}
                onUploadBackground={handleUploadBackground}
                onServerRender={(opts) => handleServerRender(opts)}
                renderHistoryId={renderHistoryId}
                rendering={rendering}
                activeZone={activeZone}
                setActiveZone={setActiveZone}
                sessionId={sessionId}
                templateId={template?.backendId ?? template?.id}
                textBlocks={textBlocks}
              />
            </div>
            </div>
          </div>
        </div>

        {/* Export Modal */}
        <ExportModal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          onExport={(opts) => {
            if ('zipFormats' in opts && opts.zipFormats) {
              handleExportZip(opts as unknown & { zipFormats: string[] });
            } else {
              handleExportClient(opts);
            }
          }}
          onServerRender={handleServerRender}
          isRendering={rendering}
        />
      </main>
    </div>
  );
};

export default Editor;
