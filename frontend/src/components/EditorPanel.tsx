import { Template, TextCustomization, AVAILABLE_FONTS } from '@/types/template';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Download, Upload, Type, Sparkles } from 'lucide-react';
import ShareButton from './ShareButton';

interface EditorPanelProps {
  template: Template;
  texts: Record<string, string>;
  customizations: Record<string, TextCustomization>;
  onTextChange: (zoneId: string, text: string) => void;
  onCustomizationChange: (zoneId: string, custom: TextCustomization) => void;
  onDownload: () => void;
  onUploadBackground: (file: File) => void;
  onServerRender?: (options?: { format?: string; quality?: string; resolution?: string }) => void;
  renderHistoryId?: string;
  rendering?: boolean;
  activeZone: string | null;
  setActiveZone: (id: string) => void;
  sessionId?: string;
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
}

const EditorPanel = ({
  template,
  texts,
  customizations,
  onTextChange,
  onCustomizationChange,
  onDownload,
  onUploadBackground,
  onServerRender,
  renderHistoryId,
  rendering,
  activeZone,
  setActiveZone,
  sessionId,
  templateId,
  textBlocks,
}: EditorPanelProps) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadBackground(file);
  };

  return (
    <div className="space-y-6">
      {/* Text zones */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Type className="h-5 w-5 text-primary" />
          Текстовые блоки
        </h3>
        
        {template.textZones.map((zone) => {
          const custom = customizations[zone.id] || {};
          const isActive = activeZone === zone.id;

          return (
            <div
              key={zone.id}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                isActive ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/30'
              }`}
              onClick={() => setActiveZone(zone.id)}
            >
              <Label className="text-sm font-bold text-muted-foreground mb-2 block">
                {zone.label}
              </Label>
              <Textarea
                value={texts[zone.id] ?? zone.defaultText}
                onChange={(e) => onTextChange(zone.id, e.target.value)}
                className="mb-3 resize-none rounded-lg"
                rows={2}
              />

              {isActive && (
                <div className="space-y-3 pt-2 border-t border-border">
                  {/* Font */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Шрифт</Label>
                    <Select
                      value={custom.fontFamily || zone.fontFamily}
                      onValueChange={(val) =>
                        onCustomizationChange(zone.id, { ...custom, fontFamily: val })
                      }
                    >
                      <SelectTrigger className="rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_FONTS.map((f) => (
                          <SelectItem key={f.name} value={f.name}>
                            <span style={{ fontFamily: f.name }}>{f.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Font size */}
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Размер: {custom.fontSize || zone.fontSize}px
                    </Label>
                    <Slider
                      value={[custom.fontSize || zone.fontSize]}
                      onValueChange={([val]) =>
                        onCustomizationChange(zone.id, { ...custom, fontSize: val })
                      }
                      min={12}
                      max={120}
                      step={1}
                      className="mt-1"
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Цвет текста</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={custom.color || zone.color}
                        onChange={(e) =>
                          onCustomizationChange(zone.id, { ...custom, color: e.target.value })
                        }
                        className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer"
                      />
                      <Input
                        value={custom.color || zone.color}
                        onChange={(e) =>
                          onCustomizationChange(zone.id, { ...custom, color: e.target.value })
                        }
                        className="font-mono text-sm rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Position presets */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Позиция</Label>
                    <div className="flex gap-1 mt-1">
                      {[
                        { label: '⬆️ Верх', y: 0.15 },
                        { label: '⏺️ Центр', y: 0.5 },
                        { label: '⬇️ Низ', y: 0.85 },
                      ].map((pos) => (
                        <Button
                          key={pos.label}
                          variant={
                            (custom.y ?? zone.y) === pos.y ? 'default' : 'outline'
                          }
                          size="sm"
                          className="rounded-lg flex-1 text-xs"
                          onClick={() =>
                            onCustomizationChange(zone.id, { ...custom, y: pos.y })
                          }
                        >
                          {pos.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upload background */}
      <div>
        <Label className="text-sm font-bold flex items-center gap-2 mb-2">
          <Upload className="h-4 w-4 text-primary" />
          Свой фон
        </Label>
        <label className="flex items-center justify-center w-full py-3 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
          <span className="text-sm text-muted-foreground">📁 Загрузить изображение</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Download */}
      <div className="space-y-2">
        <Label className="text-sm font-bold flex items-center gap-2">
          <Download className="h-4 w-4 text-primary" />
          Скачать
        </Label>
        <Button onClick={onDownload} className="w-full rounded-xl font-bold">
          📥 Открыть экспорт
        </Button>
      </div>

      {/* Server render */}
      {onServerRender && (
        <div className="space-y-2">
          <Label className="text-sm font-bold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Рендер на сервере
          </Label>
          <Button
            onClick={() => onServerRender?.()}
            disabled={rendering}
            variant="outline"
            className="w-full rounded-xl font-bold gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {rendering ? '⏳ Рендер...' : '🖨️ Отрендерить и скачать'}
          </Button>
        </div>
      )}

      {/* Share button - always visible */}
      <ShareButton 
        templateId={template.backendId || template.id} 
        sessionId={sessionId}
        textBlocks={textBlocks}
        renderHistoryId={renderHistoryId} 
      />
    </div>
  );
};

export default EditorPanel;
