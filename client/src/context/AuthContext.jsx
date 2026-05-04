import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ttc-token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('ttc-token', token);
      // Decode a minimal user from the JWT payload (for display only)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.id || payload.sub, name: payload.name, email: payload.email });
      } catch {
        setUser({ id: 'user' });
      }
    } else {
      localStorage.removeItem('ttc-token');
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = (tokenValue, userData) => {
    setToken(tokenValue);
    if (userData) setUser(userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ttc-token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
