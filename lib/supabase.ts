import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ksyxmoqzcghszrhlpaxh.supabase.co';
const supabaseAnonKey = 'sb_publishable_U289_qf4pkGHp-G1C4kX5w_2bztcmOg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);