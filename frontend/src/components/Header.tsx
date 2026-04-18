import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { History, LogIn, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Header = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAvatar();
    }
  }, [isAuthenticated]);

  const fetchAvatar = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('/api/users/me/image', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(response.data);
      setAvatarUrl(url);
    } catch {
      setAvatarUrl(null);
    }
  };

  return (
    <header className="gradient-primary py-8 px-4 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {['🎨', '✨', '🖼️', '🌈', '💫'].map((emoji, i) => (
          <span
            key={i}
            className="absolute text-4xl animate-float"
            style={{
              left: `${15 + i * 18}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      {/* Nav buttons */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Link to="/history">
          <Button variant="secondary" size="sm" className="rounded-full gap-1.5">
            <History className="h-4 w-4" />
            История
          </Button>
        </Link>
        {isAuthenticated ? (
          <Link to="/profile">
            <Button variant="secondary" size="sm" className="rounded-full gap-2 pr-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Аватар"
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm">👤</span>
              )}
              Профиль
            </Button>
          </Link>
        ) : (
          <Link to="/auth" state={{ redirectTo: location.pathname }}>
            <Button variant="secondary" size="sm" className="rounded-full gap-1.5">
              <LogIn className="h-4 w-4" />
              Войти
            </Button>
          </Link>
        )}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <Link to="/" className="inline-block">
          <h1 className="text-4xl md:text-5xl font-black mb-2 drop-shadow-lg" style={{ fontFamily: 'Fredoka', color: 'white' }}>
            🎨 PicText Studio
          </h1>
        </Link>
        <p className="text-lg md:text-xl font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
          Создавай яркие картинки с текстом за секунды! ✨
        </p>
      </div>
    </header>
  );
};

export default Header;
