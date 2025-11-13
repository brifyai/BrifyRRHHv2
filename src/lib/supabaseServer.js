import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client (no browser dependencies)
// Environment variables will be read lazily when the client is used

// Create server-side Supabase client with lazy validation
let _supabaseServer = null;

export const supabaseServer = new Proxy({}, {
  get(target, prop) {
    // Lazy initialization and validation
    if (!_supabaseServer) {
      // Read environment variables at runtime, not import time
      const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
      const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY
      const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY

      console.log('🔍 Runtime environment check:');
      console.log('- SUPABASE_URL:', SUPABASE_URL ? 'Present' : 'Missing');
      console.log('- SUPABASE_KEY:', SUPABASE_KEY ? 'Present' : 'Missing');

      if (!SUPABASE_URL || !SUPABASE_KEY) {
        throw new Error('Missing Supabase configuration. Please check your environment variables.')
      }

      _supabaseServer = createClient(
        SUPABASE_URL,
        SUPABASE_KEY,
        {
          auth: {
            persistSession: false, // No session persistence on server
            autoRefreshToken: false, // No auto refresh on server
            detectSessionInUrl: false, // No URL detection on server
            flow: 'pkce'
          },
          global: {
            headers: {
              'X-Client-Info': 'StaffHub/1.0.0 (server)',
              'X-Forced-Project': 'tmqglnycivlcjijoymwe'
            }
          },
          db: {
            schema: 'public'
          },
          realtime: {
            disabled: true // Disable realtime on server
          }
        }
      );
    }

    return _supabaseServer[prop];
  }
});

// Export configuration for reference (lazy loaded)
export const config = new Proxy({}, {
  get(target, prop) {
    const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY
    const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY

    return {
      url: SUPABASE_URL,
      key: SUPABASE_KEY,
      environment: process.env.NODE_ENV || 'development',
      isServiceRole: !!SUPABASE_SERVICE_ROLE_KEY
    }[prop];
  }
});