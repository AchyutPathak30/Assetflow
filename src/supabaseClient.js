import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'http://localhost:54321') {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
  }
}

if (!supabaseInstance) {
  console.warn('Supabase credentials missing or invalid. Initializing fallback mock Supabase client.');
  
  // Create a recursive thenable Proxy client to prevent runtime crashes for any arbitrary query chain
  const createMockChain = () => {
    const target = () => {};
    target.then = (onFulfilled) => {
      return Promise.resolve({ data: null, error: null }).then(onFulfilled);
    };
    return new Proxy(target, {
      get(t, prop) {
        if (prop === 'then') return t.then;
        return createMockChain();
      },
      apply() {
        return createMockChain();
      }
    });
  };

  supabaseInstance = {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: {}, error: { message: 'Supabase client unconfigured' } }),
      signUp: async () => ({ data: {}, error: { message: 'Supabase client unconfigured' } }),
      signOut: async () => {}
    },
    from: () => createMockChain()
  };
}

export const supabase = supabaseInstance;
