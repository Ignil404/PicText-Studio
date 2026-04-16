import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Eye, Move, Type, Palette } from 'lucide-react';
import { api } from '@/hooks/useAuth';
import { AVAILABLE_FONTS } from '@/types/template';

export interface TemplateFormData {
  id?: string;
  name: string;
  category: string;
  image_path: string;
  width: number;
  height: number;
  text_zones: Array<{
    id: string;
    x: number;
    y: number;
    font_family: string;
    font_size: number;
    color: string;
    width?: number;
    height?: number;
    default_text?: string;
    label?: string;
    shadow?: boolean;
  }>;
}

interface TemplateFormProps {
  template?: Partial<TemplateFormData> | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TemplateForm = ({ template, isOpen, onClose, onSuccess }: TemplateFormProps) => {
  const isEditing = !!template?.id;
  const [showPreview, setShowPreview] = useState(false);
  const [previewTexts, setPreviewTexts] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<TemplateFormData>>(
    template || {
      name: '',
      category: '',
      image_path: '',
      width: 800,
      height: 600,
      text_zones: [],
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newZone, setNewZone] = useState({ x: 50, y: 50, font_size: 24, font_family: 'Nunito', color: '#000000', label: '' });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        category: template.category || '',
        image_path: template.image_path || '',
        width: template.width || 800,
        height: template.height || 600,
        text_zones: template.text_zones || [],
      });
      const texts: Record<string, string> = {};
      (template.text_zones || []).forEach((zone: any) => {
        texts[zone.id] = zone.default_text || zone.label || '';
      });
      setPreviewTexts(texts);
    } else {
      setFormData({
        name: '',
        category: '',
        image_path: '',
        width: 800,
        height: 600,
        text_zones: [],
      });
      setPreviewTexts({});
    }
  }, [template]);

  const handlePreviewTextChange = (zoneId: string, text: string) => {
    setPreviewTexts({ ...previewTexts, [zoneId]: text });
  };

  const addTextZone = () => {
    const id = `text_${Date.now()}`;
    const newZoneData = {
      id,
      x: newZone.x,
      y: newZone.y,
      font_family: newZone.font_family,
      font_size: newZone.font_size,
      color: newZone.color,
      label: newZone.label || id,
      default_text: '',
      shadow: false,
    };
    setFormData({
      ...formData,
      text_zones: [...(formData.text_zones || []), newZoneData],
    });
    setPreviewTexts({ ...previewTexts, [id]: '' });
    setNewZone({ x: 50, y: 50, font_size: 24, font_family: 'Arial', color: '#000000', label: '' });
  };

  const removeTextZone = (zoneId: string) => {
    setFormData({
      ...formData,
      text_zones: (formData.text_zones || []).filter(z => z.id !== zoneId),
    });
    const newTexts = { ...previewTexts };
    delete newTexts[zoneId];
    setPreviewTexts(newTexts);
  };

  const updateTextZone = (zoneId: string, field: string, value: any) => {
    setFormData({
      ...formData,
      text_zones: (formData.text_zones || []).map(z => 
        z.id === zoneId ? { ...z, [field]: value } : z
      ),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing && template?.id) {
        await api.put(`/api/admin/templates/${template.id}`, formData);
      } else {
        await api.post('/api/admin/templates', formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const previewScale = Math.min(400 / (formData.width || 400), 300 / (formData.height || 300));

  return (
    <Card className="mb-8 border-2 border-indigo-100 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between bg-indigo-50/50 pb-4">
        <CardTitle className="text-xl font-bold text-slate-900">
          {isEditing ? 'Edit Template' : 'Create New Template'}
        </CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowPreview(!showPreview)}
            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Live Preview */}
          {showPreview && (
            <div className="border-2 border-indigo-100 rounded-xl p-4 bg-slate-50">
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Live Preview
              </h4>
              <div 
                className="relative bg-white border-2 border-slate-200 rounded-lg overflow-hidden mx-auto"
                style={{ 
                  width: Math.min(formData.width || 400, 400), 
                  height: Math.min(formData.height || 300, 300) 
                }}
              >
                {formData.image_path ? (
                  <img
                    src={formData.image_path}
                    alt="Template preview"
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🖼️</div>
                      <div>No image</div>
                    </div>
                  </div>
                )}
                {(formData.text_zones || []).map((zone, idx) => (
                  <div
                    key={zone.id || idx}
                    className="absolute"
                    style={{
                      left: zone.x * previewScale,
                      top: zone.y * previewScale,
                      fontFamily: zone.font_family,
                      fontSize: (zone.font_size || 16) * previewScale,
                      color: zone.color,
                      textShadow: zone.shadow ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none',
                    }}
                  >
                    {previewTexts[zone.id] || zone.default_text || zone.label || 'Text'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 font-medium">Template Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Awesome Template"
                required
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-slate-700 font-medium">Category *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="motivation, meme, quote"
                required
                className="border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_path" className="text-slate-700 font-medium">Image URL *</Label>
            <Input
              id="image_path"
              value={formData.image_path}
              onChange={(e) => setFormData({ ...formData, image_path: e.target.value })}
              placeholder="https://example.com/template.jpg"
              required
              className="border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="width" className="text-slate-700 font-medium">Width (px) *</Label>
              <Input
                id="width"
                type="number"
                value={formData.width}
                onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) || 800 })}
                placeholder="800"
                required
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height" className="text-slate-700 font-medium">Height (px) *</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 600 })}
                placeholder="600"
                required
                className="border-slate-200"
              />
            </div>
          </div>

          {/* Text Zones Section */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Type className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-slate-900">Text Zones</h3>
              <span className="text-sm text-slate-500">({formData.text_zones?.length || 0} zones)</span>
            </div>

            {/* Add New Zone */}
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-slate-700 mb-3">Add New Text Zone</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Input
                  type="number"
                  placeholder="X position"
                  value={newZone.x}
                  onChange={(e) => setNewZone({ ...newZone, x: parseInt(e.target.value) || 0 })}
                  className="border-slate-200"
                />
                <Input
                  type="number"
                  placeholder="Y position"
                  value={newZone.y}
                  onChange={(e) => setNewZone({ ...newZone, y: parseInt(e.target.value) || 0 })}
                  className="border-slate-200"
                />
                <Input
                  type="number"
                  placeholder="Font size"
                  value={newZone.font_size}
                  onChange={(e) => setNewZone({ ...newZone, font_size: parseInt(e.target.value) || 24 })}
                  className="border-slate-200"
                />
                <select
                  value={newZone.font_family}
                  onChange={(e) => setNewZone({ ...newZone, font_family: e.target.value })}
                  className="border border-slate-200 rounded-md px-3 py-2 text-sm"
                >
                  {AVAILABLE_FONTS.map(f => (
                    <option key={f.name} value={f.name} style={{ fontFamily: f.name }}>{f.label}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={newZone.color}
                    onChange={(e) => setNewZone({ ...newZone, color: e.target.value })}
                    className="w-10 h-10 p-1 border-slate-200"
                  />
                  <Button type="button" onClick={addTextZone} className="bg-indigo-600 hover:bg-indigo-700">
                    <Move className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Zone List */}
            {(formData.text_zones || []).length > 0 ? (
              <div className="space-y-3">
                {(formData.text_zones || []).map((zone, idx) => (
                  <div key={zone.id || idx} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-slate-900">{zone.label || zone.id}</span>
                        <span 
                          className="px-2 py-0.5 rounded text-xs"
                          style={{ backgroundColor: zone.color + '20', color: zone.color }}
                        >
                          {zone.font_family}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-slate-500">X:</span> {zone.x}
                        </div>
                        <div>
                          <span className="text-slate-500">Y:</span> {zone.y}
                        </div>
                        <div>
                          <span className="text-slate-500">Size:</span> {zone.font_size}px
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500">Color:</span>
                          <div className="w-4 h-4 rounded border" style={{ backgroundColor: zone.color }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <Label className="text-xs text-slate-500 mb-1 block">Preview Text</Label>
                      <Input
                        value={previewTexts[zone.id] || ''}
                        onChange={(e) => handlePreviewTextChange(zone.id, e.target.value)}
                        placeholder="Enter preview text..."
                        className="border-slate-200"
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => removeTextZone(zone.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
                <Type className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p>No text zones added yet</p>
                <p className="text-sm">Add text zones to allow users to add text to this template</p>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="border-slate-200">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? 'Saving...' : isEditing ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TemplateForm;