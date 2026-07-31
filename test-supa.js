const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, ...vals] = line.split('=');
    env[key.trim()] = vals.join('=').trim();
  }
});

const url = env['NEXT_PUBLIC_SUPABASE_URL'];
const key = env['SUPABASE_SERVICE_ROLE_KEY'];

console.log('URL:', url);
console.log('KEY:', key.substring(0, 10) + '...');

const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('delegates').select('*').limit(1);
  if (error) {
    console.error('Error selecting delegates:', error);
  } else {
    console.log('Delegates fetched:', data.length);
  }
}
test();
