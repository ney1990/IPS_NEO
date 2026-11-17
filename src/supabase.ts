import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const configured = Boolean(url && publishableKey &&
  !url.includes('YOUR_PROJECT_REF') && !publishableKey.includes('YOUR_PUBLIC'));

export const supabase = configured
  ? createClient(url!, publishableKey!, {
      auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
    })
  : null;
