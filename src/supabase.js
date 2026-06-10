import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project credentials
const supabaseUrl = 'https://ggxmxrugmtzlqtqqpuar.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdneG14cnVnbXR6bHF0cXFwdWFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NjY5MzgsImV4cCI6MjA5NjM0MjkzOH0.rz0pZmZBO_yRSRyAsIICUrz_WdXyESye_0R50tkvWbE';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Storage bucket name
export const STORAGE_BUCKET = 'taskflow-files';
