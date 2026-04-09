import { Template } from '@/types/template';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { useRef, useEffect } from 'react';

interface TemplateCardProps {
  template: Template;
}

const TemplateCard = ({ template }: TemplateCardProps) => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 300;
    const scale = size / Math.max(template.width, template.height);
    canvas.width = size;
    canvas.height = (template.height / template.width) * size;

    // Draw background
    if (template.background.type === 'solid') {
      ctx.fillStyle = template.background.value;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (template.background.type === 'gradient') {
      // Parse CSS gradient to canvas gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      const colors = template.background.value.match(/#[a-fA-F0-9]{6}/g) || ['#666', '#999'];
      colors.forEach((color, i) => {
        gradient.addColorStop(i / (colors.length - 1), color);
      });
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw decorations
    template.decorations?.forEach((dec) => {
      if (dec.type === 'emoji') {
        ctx.save();
        ctx.globalAlpha = dec.opacity ?? 1;
        ctx.font = `${dec.size * scale}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (dec.rotation) {
          ctx.translate(dec.x * canvas.width, dec.y * canvas.height);
          ctx.rotate((dec.rotation * Math.PI) / 180);
          ctx.fillText(dec.value, 0, 0);
        } else {
          ctx.fillText(dec.value, dec.x * canvas.width, dec.y * canvas.height);
        }
        ctx.restore();
      }
    });

    // Draw text zones
    template.textZones.forEach((zone) => {
      ctx.save();
      const fontSize = zone.fontSize * scale;
      const weight = zone.bold ? '700' : '400';
      const style = zone.italic ? 'italic ' : '';
      ctx.font = `${style}${weight} ${fontSize}px ${zone.fontFamily}, sans-serif`;
      ctx.fillStyle = zone.color;
      ctx.textAlign = zone.align;
      ctx.textBaseline = 'middle';

      if (zone.shadow) {
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 4 * scale;
        ctx.shadowOffsetY = 2 * scale;
      }

      if (zone.strokeColor) {
        ctx.strokeStyle = zone.strokeColor;
        ctx.lineWidth = (zone.strokeWidth || 2) * scale;
        ctx.lineJoin = 'round';
      }

      const lines = zone.defaultText.split('\n');
      const lineHeight = fontSize * 1.3;
      const startY = zone.y * canvas.height - ((lines.length - 1) * lineHeight) / 2;

      lines.forEach((line, i) => {
        const x = zone.x * canvas.width;
        const y = startY + i * lineHeight;
        if (zone.strokeColor) {
          ctx.strokeText(line, x, y);
        }
        ctx.fillText(line, x, y);
      });

      ctx.restore();
    });
  }, [template]);

  return (
    <Card
      className="group cursor-pointer overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1"
      onClick={() => navigate(`/editor/${template.id}`)}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
        />
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold text-sm shadow-lg">
            ✏️ Редактировать
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{template.emoji}</span>
          <h3 className="font-bold text-foreground text-sm">{template.name}</h3>
        </div>
      </div>
    </Card>
  );
};

export default TemplateCard;
