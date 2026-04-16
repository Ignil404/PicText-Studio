import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Search, Edit, Trash2, AlertTriangle, ImageIcon, X } from 'lucide-react';
import { TemplateForm, TemplateFormData } from '@/components/admin/TemplateForm';
import { api } from '@/hooks/useAuth';

type StatusFilter = 'all' | 'active' | 'inactive';

interface Template {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  imageUrl: string;
  image_path?: string;
  text_zones?: Array<{
    id: string;
    x: number;
    y: number;
    font_family: string;
    font_size: number;
    color: string;
  }>;
  is_active?: boolean;
}

interface TemplateListResponse {
  items: Template[];
  total: number;
  page: number;
  page_size: number;
}

export const AdminTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<TemplateFormData> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      const params = new URLSearchParams();
      params.set('page', '1');
      params.set('page_size', '100');
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      
      const response = await api.get<TemplateListResponse>(`/api/admin/templates?${params.toString()}`);
      setTemplates(response.data.items);
    } catch {
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchTemplates();
  }, [search, statusFilter]);

  const handleEdit = (template: Template) => {
    setEditingTemplate({
      id: template.id,
      name: template.name,
      category: template.category,
      image_path: template.imageUrl,
      width: template.width,
      height: template.height,
      text_zones: template.text_zones || [],
    });
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/admin/templates/${id}`);
      setDeleteConfirmId(null);
      fetchTemplates();
    } catch {
      alert('Failed to delete template');
    }
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    fetchTemplates();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="text-slate-500 text-lg">Loading templates...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-200">
          <p className="font-medium">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()} className="bg-indigo-600 hover:bg-indigo-700">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Templates</h1>
          <p className="text-slate-500 mt-2">
            Manage your image templates ({templates.length} total)
          </p>
        </div>
        <Button 
          onClick={handleCreate} 
          className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 rounded-lg font-medium flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Template
        </Button>
      </div>

      {/* Template Form */}
      {formOpen && (
        <TemplateForm
          template={editingTemplate}
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-11 border-slate-200"
            />
          </div>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {(['all', 'active', 'inactive'] as StatusFilter[]).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={`${statusFilter === status ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {status === 'all' ? 'All' : status === 'active' ? 'Active' : 'Inactive'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No templates found</h3>
          <p className="text-slate-500 mb-6">Get started by creating your first template</p>
          <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map((template) => (
            <div 
              key={template.id} 
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all group"
            >
              {/* Image */}
              <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                {template.imageUrl ? (
                  <img
                    src={template.imageUrl}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-slate-300" />
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    template.is_active !== false 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {template.is_active !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 truncate">{template.name}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {template.category}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  {template.width} × {template.height}
                </p>
                
                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-slate-200 text-red-500 hover:text-red-600 hover:border-red-300"
                    onClick={() => setDeleteConfirmId(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg text-slate-900">Delete Template?</h3>
            </div>
            <p className="text-slate-500 mb-6">
              This action cannot be undone. The template will be permanently removed.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 border-slate-200"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={() => handleDelete(deleteConfirmId)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTemplates;