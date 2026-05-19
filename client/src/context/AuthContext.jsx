import { createContext, useContext, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { setTokenGetter } from '../api/axios';

const AuthContext = createContext();

/**
 * Thin adapter over Auth0's React SDK. The rest of the app stays unaware
 * of the underlying provider — it only sees `user`, `isAuthenticated`,
 * `login()`, `logout()`. Swapping Auth0 for another OIDC provider is a
 * one-file change.
 */
export function AuthProvider({ children }) {
  const {
    user,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();

  // Register the async token-getter with the axios interceptor.
  useEffect(() => {
    setTokenGetter(async () => {
      if (!isAuthenticated) return null;
      return getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      });
    });
  }, [getAccessTokenSilently, isAuthenticated]);

  const login = () =>
    loginWithRedirect({
      authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
    });

  const signup = () =>
    loginWithRedirect({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        screen_hint: 'signup',
      },
    });

  const logout = () =>
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });

  const value = {
    user: user ? { id: user.sub, name: user.name, email: user.email, picture: user.picture } : null,
    isAuthenticated,
    loading: isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
