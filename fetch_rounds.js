process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bdomarloiidphhprftgg.supabase.co';
const supabaseKey = 'sb_publishable_PldRRuexJQ7mI3-u2HsJPw_Vr1yHkzT';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('rounds').select('*');
  if (error) {
    console.error('Error fetching rounds:', error);
  } else {
    console.log('Rounds:', data);
  }
}

main();
