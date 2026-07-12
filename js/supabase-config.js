// Configuración de conexión a Supabase - AulaSENA
const SUPABASE_URL = 'https://dwmcoigymyolmblmhwjd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3bWNvaWd5bXlvbG1ibG1od2pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4NjU3OTIsImV4cCI6MjA5OTQ0MTc5Mn0.sN0MRi27neNAusHmakwV6P44WrtDgjn9M4Ge3JbjIV8';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
