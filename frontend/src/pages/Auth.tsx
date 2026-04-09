import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';

const Auth = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-card rounded-2xl border-2 border-border p-8 shadow-lg text-center">
        <p className="text-4xl mb-4">🔐</p>
        <h2 className="text-2xl font-bold mb-2">Авторизация</h2>
        <p className="text-muted-foreground mb-6">
          Функция авторизации скоро будет доступна. Сейчас вы работаете в гостевом режиме.
        </p>
        <Link to="/">
          <Button className="rounded-full">← Вернуться на главную</Button>
        </Link>
      </div>
    </div>
  </div>
);

export default Auth;
