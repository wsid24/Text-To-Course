import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

/**
 * Auth0 access tokens are fetched per-request via `getAccessTokenSilently`,
 * which is a hook — we can't call it from a module-level axios interceptor.
 * The fix: AuthProvider registers a token-getter on mount, and the
 * interceptor resolves it lazily. Decouples networking from React state.
 */
let _tokenGetter = null;
export const setTokenGetter = (fn) => { _tokenGetter = fn; };

API.interceptors.request.use(async (config) => {
  if (_tokenGetter) {
    try {
      const token = await _tokenGetter();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // not signed in or silent renewal failed — request will be 401
    }
  }
  return config;
});

export default API;
