import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import TemplateCard from '@/components/TemplateCard';
import { templates as localTemplates } from '@/data/templates';
import { TemplateCategory, CATEGORY_LABELS } from '@/types/template';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { fetchTemplates, mergeTemplates } from '@/api/client';

const categoryOrder: (TemplateCategory | 'all')[] = [
  'all',
  'motivation',
  'demotivator',
  'greeting',
  'meme',
  'quote',
  'reaction',
];

const Index = () => {
  const [templates, setTemplates] = useState(localTemplates);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTemplates()
      .then((backend) => {
        setTemplates(mergeTemplates(backend, localTemplates));
      })
      .catch((err) => {
        // Backend unavailable — fall back to local templates
        if (import.meta.env.DEV) {
          console.warn('Backend templates unavailable, using local data', err);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = templates.filter((t) => {
    const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = categoryOrder.filter(
    (cat) =>
      cat === 'all' || templates.some((t) => t.category === cat),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Поиск шаблонов..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-full border-2 focus-visible:ring-primary"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              onClick={() => setActiveCategory(cat)}
              className="rounded-full px-5 font-bold transition-all"
              size="sm"
            >
              {cat === 'all' ? '🎯 Все' : CATEGORY_LABELS[cat]}
            </Button>
          ))}
        </div>

        {/* Templates grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-muted-foreground text-lg">Ничего не найдено</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
