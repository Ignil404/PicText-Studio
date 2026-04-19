import React, { useRef, useEffect, useCallback } from 'react';
import { Template, TextCustomization } from '@/types/template';
import { StickerBlock, ShapeBlock } from '@/shared/types';

interface CanvasPreviewProps {
  template: Template;
  texts: Record<string, string>;
  customizations: Record<string, TextCustomization>;
  customBackground?: string;
  stickerBlocks?: StickerBlock[];
  shapeBlocks?: ShapeBlock[];
  onMoveSticker?: (id: string, x: number, y: number) => void;
  onMoveShape?: (id: string, x: number, y: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const CanvasPreview = ({
  template,
  texts,
  customizations,
  customBackground,
  stickerBlocks = [],
  shapeBlocks = [],
  onMoveSticker,
  onMoveShape,
  canvasRef,
}: CanvasPreviewProps) => {
  const [dragState, setDragState] = React.useState<{
    type: 'sticker' | 'shape';
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check if clicking on a sticker
    const clickedSticker = stickerBlocks.find((s) => {
      const sx = s.x * canvas.width;
      const sy = s.y * canvas.height;
      const size = s.size;
      return Math.abs(x - sx) < size / 2 && Math.abs(y - sy) < size / 2;
    });

    if (clickedSticker) {
      setDragState({
        type: 'sticker',
        id: clickedSticker.id,
        startX: x,
        startY: y,
        origX: clickedSticker.x,
        origY: clickedSticker.y,
      });
      return;
    }

    // Check if clicking on a shape
    const clickedShape = shapeBlocks.find((s) => {
      const sx = s.x * canvas.width;
      const sy = s.y * canvas.height;
      const sw = (s.width || 100) * canvas.width;
      const sh = (s.height || 100) * canvas.height;
      return x > sx && x < sx + sw && y > sy && y < sy + sh;
    });

    if (clickedShape) {
      setDragState({
        type: 'shape',
        id: clickedShape.id,
        startX: x,
        startY: y,
        origX: clickedShape.x,
        origY: clickedShape.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragState) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const dx = (x - dragState.startX) / canvas.width;
    const dy = (y - dragState.startY) / canvas.height;

    const newX = Math.max(0, Math.min(1, dragState.origX + dx));
    const newY = Math.max(0, Math.min(1, dragState.origY + dy));

    if (dragState.type === 'sticker' && onMoveSticker) {
      onMoveSticker(dragState.id, newX, newY);
    } else if (dragState.type === 'shape' && onMoveShape) {
      onMoveShape(dragState.id, newX, newY);
    }
  };

  const handleMouseUp = () => {
    setDragState(null);
  };
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = template.width;
    canvas.height = template.height;

    const drawContent = () => {
      // Background
      if (customBackground) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          drawImageCover(ctx, img, canvas.width, canvas.height);
          drawOverlay();
        };
        img.src = customBackground;
        return;
      }

      if (template.background.type === 'solid') {
        ctx.fillStyle = template.background.value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (template.background.type === 'gradient') {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        const colors = template.background.value.match(/#[a-fA-F0-9]{6}/g) || ['#666', '#999'];
        colors.forEach((color, i) => {
          gradient.addColorStop(i / (colors.length - 1), color);
        });
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      drawOverlay();
    };

    const drawOverlay = () => {
      // Decorations
      template.decorations?.forEach((dec) => {
        if (dec.type === 'emoji') {
          ctx.save();
          ctx.globalAlpha = dec.opacity ?? 1;
          ctx.font = `${dec.size}px "Inter", sans-serif`;
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

      // Stickers
      stickerBlocks.forEach((sticker) => {
        ctx.save();
        ctx.font = `${sticker.size}px "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sticker.emoji, sticker.x * canvas.width, sticker.y * canvas.height);
        ctx.restore();
      });

      // Shapes
      shapeBlocks.forEach((shape) => {
        ctx.save();
        const x = shape.x * canvas.width;
        const y = shape.y * canvas.height;
        const w = shape.width || 100;
        const h = shape.height || 100;
        ctx.strokeStyle = shape.color;
        ctx.fillStyle = shape.color;
        ctx.lineWidth = shape.strokeWidth;

        if (shape.type === 'rectangle') {
          if (shape.filled) {
            ctx.fillRect(x, y, w, h);
          } else {
            ctx.strokeRect(x, y, w, h);
          }
        } else if (shape.type === 'circle') {
          ctx.beginPath();
          ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
          if (shape.filled) {
            ctx.fill();
          } else {
            ctx.stroke();
          }
        } else if (shape.type === 'line') {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + w, y + h);
          ctx.stroke();
        } else if (shape.type === 'arrow') {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + w, y + h);
          ctx.stroke();
          // Arrow head
          const angle = Math.atan2(h, w);
          const arrowSize = Math.max(shape.strokeWidth * 3, 10);
          const headAngle = 0.5;
          const ex = x + w, ey = y + h;
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(
            ex - arrowSize * Math.cos(angle - headAngle),
            ey - arrowSize * Math.sin(angle - headAngle)
          );
          ctx.lineTo(
            ex - arrowSize * Math.cos(angle + headAngle),
            ey - arrowSize * Math.sin(angle + headAngle)
          );
          ctx.closePath();
          if (shape.filled) {
            ctx.fill();
          } else {
            ctx.stroke();
          }
        }

        ctx.restore();
      });

      // Text zones
      template.textZones.forEach((zone) => {
        const custom = customizations[zone.id] || {};
        const text = texts[zone.id] ?? zone.defaultText;
        const fontFamily = custom.fontFamily || zone.fontFamily;
        const fontSize = custom.fontSize || zone.fontSize;
        const color = custom.color || zone.color;
        const x = (custom.x ?? zone.x) * canvas.width;
        const y = (custom.y ?? zone.y) * canvas.height;

        ctx.save();
        const weight = zone.bold ? '700' : '400';
        const style = zone.italic ? 'italic ' : '';
        ctx.font = `${style}${weight} ${fontSize}px "${fontFamily}", sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = zone.align;
        ctx.textBaseline = 'middle';

        if (zone.shadow) {
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 3;
        }

        if (zone.strokeColor) {
          ctx.strokeStyle = zone.strokeColor;
          ctx.lineWidth = zone.strokeWidth || 2;
          ctx.lineJoin = 'round';
        }

        const maxWidth = zone.maxWidth * canvas.width;
        const lines = wrapText(ctx, text, maxWidth);
        const lineHeight = fontSize * 1.3;
        const startY = y - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((line, i) => {
          const ly = startY + i * lineHeight;
          if (zone.strokeColor) {
            ctx.strokeText(line, x, ly);
          }
          ctx.fillText(line, x, ly);
        });

        ctx.restore();
      });
    };

    drawContent();
  }, [template, texts, customizations, customBackground, stickerBlocks, shapeBlocks, onMoveSticker, onMoveShape, canvasRef]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="flex items-center justify-center bg-muted/50 rounded-xl p-4 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-[70vh] rounded-lg shadow-2xl cursor-move"
        style={{ imageRendering: 'auto' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource & { width: number; height: number },
  targetWidth: number,
  targetHeight: number,
) {
  const sourceAspect = image.width / image.height;
  const targetAspect = targetWidth / targetHeight;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = image.width;
  let sourceHeight = image.height;

  if (sourceAspect > targetAspect) {
    sourceWidth = image.height * targetAspect;
    sourceX = (image.width - sourceWidth) / 2;
  } else {
    sourceHeight = image.width / targetAspect;
    sourceY = (image.height - sourceHeight) / 2;
  }

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    targetWidth,
    targetHeight,
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const result: string[] = [];
  const paragraphs = text.split('\n');

  paragraphs.forEach((para) => {
    const words = para.split(' ');
    let line = '';

    words.forEach((word) => {
      const testLine = line ? `${line} ${word}` : word;
      const { width } = ctx.measureText(testLine);
      if (width > maxWidth && line) {
        result.push(line);
        line = word;
      } else {
        line = testLine;
      }
    });

    if (line) result.push(line);
  });

  return result.length ? result : [''];
}

export default CanvasPreview;
