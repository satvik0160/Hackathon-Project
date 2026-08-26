import { createClient } from '@insforge/sdk';
const insforge = createClient({ baseUrl: 'https://6vjqpi3p.us-west.insforge.app', anonKey: 'anon_7864b4a50094554f3a6eb708d22b6faaa29aacac30ab5c92e500955fa9c63d58' });

async function run() {
  await insforge.auth.signInWithPassword({ email: 'test_1724649887718@example.com', password: 'Password123!' });
  const userData = { test: 1 };
  const { data: authData } = await insforge.auth.getCurrentUser();
  const userId = authData?.user?.id;
  
  const { data, error } = await insforge.auth.updateUser({ data: userData });
  
  let tableData = {};
  const { data: existingData, error: selectErr } = await insforge.from('users').select('*').eq('id', userId).single();
  if (!selectErr && existingData) {
    tableData = existingData;
  }
  
  console.log("Merged data:");
  console.log({ data: { ...tableData, ...data.user.user_metadata } });
}

run().catch(e => console.error("Caught error:", e));
