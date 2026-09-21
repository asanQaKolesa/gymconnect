// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qkcknohwkgcsxduweoyv.supabase.co'; // твой URL из панели Supabase
const supabaseKey = 'sb_publishable_W9T-xstG7unSUljmq3dJDQ_yX723gKP'; // твой новый Publishable key

export const supabase = createClient(supabaseUrl, supabaseKey);
