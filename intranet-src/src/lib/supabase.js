import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hvbdpgkdcdskhpbdeeim.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_kB69BlNpkNhOllwGMOE6xg_i4l1VHMv'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})
