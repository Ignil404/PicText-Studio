import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/useAuth';

const Profile = () => {
  const { sessionId } = useSession();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-card rounded-2xl border-2 border-border p-8 shadow-lg text-center">
          <p className="text-4xl mb-4">👤</p>
          <h2 className="text-2xl font-bold mb-2">Профиль</h2>
          <p className="text-muted-foreground mb-4">
            Функция профиля скоро будет доступна.
          </p>
          <p className="text-sm text-muted-foreground mb-6 font-mono">
            Session ID: {sessionId}
          </p>
          <Link to="/">
            <Button className="rounded-full">← Вернуться на главную</Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Profile;
