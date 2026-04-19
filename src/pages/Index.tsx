import { useState } from 'react';
import Header from '@/components/Header';
import TemplateCard from '@/components/TemplateCard';
import { templates } from '@/data/templates';
import { TemplateCategory, CATEGORY_LABELS } from '@/types/template';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const categories: (TemplateCategory | 'all')[] = ['all', 'motivation', 'demotivator', 'greeting', 'meme', 'quote'];

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = templates.filter((t) => {
    const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
