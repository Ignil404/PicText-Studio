import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSessionId } from '@/lib/session';

interface SessionContextType {
  sessionId: string;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType>({
  sessionId: '',
  loading: true,
});

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSessionId(getSessionId());
    setLoading(false);
  }, []);

  return (
    <SessionContext.Provider value={{ sessionId, loading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
