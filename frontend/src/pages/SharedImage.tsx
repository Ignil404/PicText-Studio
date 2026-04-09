import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';

const SharedImage = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="max-w-3xl mx-auto px-4 py-8 text-center">
      <div className="bg-card rounded-2xl border-2 border-border p-8 shadow-lg">
        <p className="text-4xl mb-4">🔗</p>
        <h2 className="text-2xl font-bold mb-2">Публичные картинки</h2>
        <p className="text-muted-foreground mb-6">
          Функция публичных шар пока не доступна.
        </p>
        <Link to="/">
          <Button className="rounded-full">← На главную</Button>
        </Link>
      </div>
    </main>
  </div>
);

export default SharedImage;
