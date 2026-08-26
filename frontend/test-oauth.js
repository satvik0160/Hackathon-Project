import { createClient } from '@insforge/sdk';

const insforge = createClient({
  baseUrl: 'https://api.insforge.dev',
  anonKey: 'public-anon-key-placeholder'
});

async function test() {
  try {
    const { data, error } = await insforge.auth.signInWithOAuth({
      provider: 'google',
      redirectTo: 'http://localhost:5173/dashboard'
    });
    console.log("Data:", data);
    if (error) console.log("Error:", error);
  } catch (e) {
    console.log("Exception:", e);
  }
}
test();
