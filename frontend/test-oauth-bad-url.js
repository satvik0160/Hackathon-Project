import { createClient } from '@insforge/sdk';

const insforge = createClient({
  baseUrl: 'https://6vjqpi3p.us-west.insforge.app',
  anonKey: 'anon_7864b4a50094554f3a6eb708d22b6faaa29aacac30ab5c92e500955fa9c63d58'
});

async function test() {
  const { data, error } = await insforge.auth.signInWithOAuth({
    provider: 'google',
    redirectTo: 'https://random-url.com/auth/callback',
    skipBrowserRedirect: true
  });
  console.log("Data:", data);
  if (error) console.log("Error:", error);
}
test();
