import { createClient } from '@insforge/sdk';
const insforge = createClient({ baseUrl: 'https://6vjqpi3p.us-west.insforge.app', anonKey: 'anon_7864b4a50094554f3a6eb708d22b6faaa29aacac30ab5c92e500955fa9c63d58' });

async function test() {
  const { data: authData, error: authError } = await insforge.auth.signInWithPassword({ email: 'test_1724649887718@example.com', password: 'Password123!' });
  console.log("Login Error:", authError);
  console.log("Login Data:", authData);
  
  if (!authError) {
    const res = await insforge.auth.updateUser({ data: { test: 1 } });
    console.log("Update res data:", res.data);
    console.log("Update res error:", res.error);
  }
}
test();
