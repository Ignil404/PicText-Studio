import { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state && typeof location.state === 'object' && 'redirectTo' in location.state
    ? location.state.redirectTo
    : undefined;

  const getErrorMessage = (err: unknown): string => {
    if (!axios.isAxiosError(err)) {
      return 'Something went wrong. Please try again.';
    }

    const status = err.response?.status;
    if (status === 401) return 'Incorrect email or password';
    if (status === 409) return 'Email already registered';
    if (status === 422) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        return detail
          .map((item) =>
            item && typeof item === 'object' && 'msg' in item ? String(item.msg) : 'Invalid input',
          )
          .join(', ');
      }
      return 'Invalid input';
    }

    return 'Something went wrong. Please try again.';
  };

  const validate = (): string | null => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (mode === 'register' && password !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate(redirectTo === '/' ? '/' : '/profile');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-md mx-auto px-4 py-12">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">{mode === 'login' ? '🔐' : '📝'}</div>
            <CardTitle className="text-2xl">
              {mode === 'login' ? 'Вход' : 'Регистрация'}
            </CardTitle>
            <CardDescription>
              {mode === 'login'
                ? 'Введите email и пароль для входа'
                : 'Создайте аккаунт для сохранения истории'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Минимум 8 символов"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Повторите пароль"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'login' ? 'Вход...' : 'Регистрация...'}
                  </>
                ) : mode === 'login' ? (
                  'Войти'
                ) : (
                  'Зарегистрироваться'
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              {mode === 'login' ? (
                <>
                  Нет аккаунта?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-primary hover:underline font-medium"
                  >
                    Зарегистрироваться
                  </button>
                </>
              ) : (
                <>
                  Уже есть аккаунт?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-primary hover:underline font-medium"
                  >
                    Войти
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
