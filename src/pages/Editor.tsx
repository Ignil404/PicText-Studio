import { useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { templates } from '@/data/templates';
import { TextCustomization } from '@/types/template';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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
  const { user } = useAuth();
  const { toast } = useToast();

  const [texts, setTexts] = useState<Record<string, string>>({});
  const [customizations, setCustomizations] = useState<Record<string, TextCustomization>>({});
  const [customBackground, setCustomBackground] = useState<string | undefined>();
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  const handleSave = useCallback(async () => {
    if (!user || !canvasRef.current || !template) return;
    setSaving(true);
    try {
      const blob = await new Promise<Blob>((resolve) =>
        canvasRef.current!.toBlob((b) => resolve(b!), 'image/png')
      );
      const path = `${user.id}/${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from('saved-images')
        .upload(path, blob, { contentType: 'image/png' });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('saved-images').getPublicUrl(path);
      const { error: dbError } = await supabase.from('saved_images').insert({
        user_id: user.id,
        template_id: template.id,
        image_url: urlData.publicUrl,
        texts: texts as any,
        customizations: customizations as any,
        is_public: false,
      });
      if (dbError) throw dbError;
      toast({ title: '✅ Сохранено!', description: 'Картинка в вашем профиле' });
    } catch (err: any) {
      toast({ title: 'Ошибка', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }, [user, template, texts, customizations, toast]);

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
                onSave={user ? handleSave : undefined}
                saving={saving}
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
