import { createClient } from '@supabase/supabase-js';

// Подключение к твоему проекту Supabase
const supabaseUrl = 'https://ТВОЙ_ПРОЕКТ.supabase.co';
const supabaseKey = 'ТВОЙ_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);
