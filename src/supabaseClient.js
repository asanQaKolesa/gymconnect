import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qkcknohwkgcsxduweoyv.supabase.co';
const supabaseAnonKey = 'sb_publishable_W9T-xstG7unSUljmq3dJDQ_yX723gKP';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);