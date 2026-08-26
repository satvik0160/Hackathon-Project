import { createClient } from '@insforge/sdk';

const insforge = createClient({
  baseUrl: 'https://6vjqpi3p.us-west.insforge.app',
  anonKey: 'anon_7864b4a50094554f3a6eb708d22b6faaa29aacac30ab5c92e500955fa9c63d58'
});

async function run() {
  console.log('--- OAUTH ---');
  const oauthRes = await insforge.auth.signInWithOAuth({
    provider: 'google',
    redirectTo: 'http://localhost:5173/auth/callback',
    skipBrowserRedirect: true
  });
  console.log('OAuth returned:', oauthRes);

  console.log('\n--- SIGNUP ---');
  const email = `test_${Date.now()}@example.com`;
  const password = 'Password123!';
  const username = `user_${Date.now()}`;
  
  const signupRes = await insforge.auth.signUp({
    email, password, options: { data: { username, full_name: 'Test' } }
  });
  console.log('Signup 1:', signupRes.error ? signupRes.error : 'Success');

  console.log('\n--- SIGNUP DUPLICATE ---');
  const signupRes2 = await insforge.auth.signUp({
    email, password, options: { data: { username, full_name: 'Test' } }
  });
  console.log('Signup 2 (Duplicate):', signupRes2.error ? signupRes2.error : 'Success');

  console.log('\n--- LOGIN ---');
  const loginRes = await insforge.auth.signInWithPassword({
    email, password
  });
  console.log('Login:', loginRes.error ? loginRes.error : 'Success');
}

run().catch(console.error);
