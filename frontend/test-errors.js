import { createClient } from '@insforge/sdk';

const insforge = createClient({
  baseUrl: 'https://6vjqpi3p.us-west.insforge.app',
  anonKey: 'anon_7864b4a50094554f3a6eb708d22b6faaa29aacac30ab5c92e500955fa9c63d58'
});

async function run() {
  const { data, error } = await insforge.auth.signInWithPassword({ email: 'nonexistent123@example.com', password: 'wrong' });
  console.log("Error object keys:", Object.keys(error || {}));
  console.log("Error status:", error?.status);
  console.log("Error statusCode:", error?.statusCode);
  console.log("Error message:", error?.message);
}
run();
