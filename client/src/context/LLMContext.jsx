import { createContext, useContext, useEffect, useState } from 'react';

/**
 * Tracks the user's preferred primary LLM provider for generation.
 *
 * The backend's LLMRouter still keeps the other provider as automatic
 * fallback — this just chooses which one tries first. The selection
 * persists in localStorage so it survives page reloads.
 */
const LLMContext = createContext();

const STORAGE_KEY = 'ttc-llm-provider';
const DEFAULT_PROVIDER = 'groq';
export const ALLOWED_PROVIDERS = ['groq', 'gemini'];

export function LLMProvider({ children }) {
  const [provider, setProviderState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return ALLOWED_PROVIDERS.includes(stored) ? stored : DEFAULT_PROVIDER;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, provider);
    setProviderGetter(() => provider);
  }, [provider]);

  const setProvider = (p) => {
    if (ALLOWED_PROVIDERS.includes(p)) setProviderState(p);
  };

  return (
    <LLMContext.Provider value={{ provider, setProvider }}>
      {children}
    </LLMContext.Provider>
  );
}

export const useLLM = () => useContext(LLMContext);

/**
 * Module-level provider getter — lets the axios layer read the current
 * selection at request time without prop-drilling.
 */
let _providerGetter = () => DEFAULT_PROVIDER;
export const setProviderGetter = (fn) => { _providerGetter = fn; };
export const getCurrentProvider = () => _providerGetter();
