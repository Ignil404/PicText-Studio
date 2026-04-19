import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const QUALITY_KEYS = ['low', 'medium', 'high', 'lossless'] as const;
const RESOLUTION_KEYS = ['sd', 'hd', '4k'] as const;
const FORMAT_KEYS = ['png', 'jpeg', 'webp'] as const;

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: Record<string, string>) => void;
  onServerRender: (options: Record<string, string>) => void;
  isRendering?: boolean;
}

const QUALITY_MAP: Record<string, number> = {
  low: 50,
  medium: 70,
  high: 85,
  lossless: 100,
};

export const ExportModal = ({
  isOpen,
  onClose,
  onExport,
  onServerRender,
  isRendering,
}: ExportModalProps) => {
  const [format, setFormat] = useState<typeof FORMAT_KEYS[number]>('png');
  const [quality, setQuality] = useState<typeof QUALITY_KEYS[number]>('high');
  const [resolution, setResolution] = useState<typeof RESOLUTION_KEYS[number]>('hd');
  const [zipFormats, setZipFormats] = useState<string[]>(['png']);
  const [downloadMode, setDownloadMode] = useState<'single' | 'zip'>('single');

  if (!isOpen) return null;

  const handleExport = () => {
    onExport({ format, quality, resolution });
    onClose();
  };

  const handleServerRender = () => {
    onServerRender({ format, quality, resolution });
    onClose();
  };

  const handleZipFormatToggle = (fmt: string) => {
    setZipFormats((prev) =>
      prev.includes(fmt) ? prev.filter((f) => f !== fmt) : [...prev, fmt]
    );
  };

  const handleDownloadZip = () => {
    onExport({ format: 'png', quality, resolution, zipFormats: zipFormats.join(',') });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Экспорт изображения</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        {/* Download mode */}
        <div className="space-y-2">
          <Label className="text-sm font-bold">Режим загрузки</Label>
          <div className="flex gap-2">
            <Button
              variant={downloadMode === 'single' ? 'default' : 'outline'}
              onClick={() => setDownloadMode('single')}
              className="flex-1 rounded-lg"
            >
              Один файл
            </Button>
            <Button
              variant={downloadMode === 'zip' ? 'default' : 'outline'}
              onClick={() => setDownloadMode('zip')}
              className="flex-1 rounded-lg"
            >
              ZIP (все форматы)
            </Button>
          </div>
        </div>

        {downloadMode === 'single' ? (
          <>
            {/* Format */}
            <div className="space-y-2">
              <Label className="text-sm font-bold">Формат</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as typeof format)}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG (без потерь)</SelectItem>
                  <SelectItem value="jpeg">JPEG (сжатие)</SelectItem>
                  <SelectItem value="webp">WebP (оптимальный)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quality */}
            <div className="space-y-2">
              <Label className="text-sm font-bold">Качество</Label>
              <Select value={quality} onValueChange={(v) => setQuality(v as typeof quality)}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Низкое (маленький файл)</SelectItem>
                  <SelectItem value="medium">Среднее</SelectItem>
                  <SelectItem value="high">Высокое</SelectItem>
                  <SelectItem value="lossless">Без потерь</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        ) : (
          /* ZIP formats */
          <div className="space-y-2">
            <Label className="text-sm font-bold">Форматы для архива</Label>
            <div className="flex flex-wrap gap-2">
              {['png', 'jpeg', 'webp'].map((fmt) => (
                <Button
                  key={fmt}
                  variant={zipFormats.includes(fmt) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleZipFormatToggle(fmt)}
                  className="rounded-lg"
                >
                  {fmt.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Resolution */}
        <div className="space-y-2">
          <Label className="text-sm font-bold">Разрешение</Label>
          <Select value={resolution} onValueChange={(v) => setResolution(v as typeof resolution)}>
            <SelectTrigger className="rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sd">SD (640×480)</SelectItem>
              <SelectItem value="hd">HD (1920×1080)</SelectItem>
              <SelectItem value="4k">4K (3840×2160)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          {downloadMode === 'single' ? (
            <>
              <Button onClick={handleExport} className="w-full rounded-xl font-bold">
                📥 Скачать {format.toUpperCase()}
              </Button>
              <Button
                onClick={handleServerRender}
                disabled={isRendering}
                variant="outline"
                className="w-full rounded-xl font-bold"
              >
                {isRendering ? '⏳ Рендеринг...' : '🖨️ Рендер на сервере'}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleDownloadZip}
              disabled={zipFormats.length === 0}
              className="w-full rounded-xl font-bold"
            >
              📦 Скачать ZIP ({zipFormats.map((f) => f.toUpperCase()).join('+')})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportModal;