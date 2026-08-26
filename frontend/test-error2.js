import { createClient } from '@insforge/sdk';
const insforge = createClient({ baseUrl: 'https://6vjqpi3p.us-west.insforge.app', anonKey: 'anon_7864b4a50094554f3a6eb708d22b6faaa29aacac30ab5c92e500955fa9c63d58' });
async function test() {
  const { data, error } = await insforge.auth.signInWithPassword({ email: 'testuser@example.com', password: 'password123' });
  console.log("Error object:", error);
  console.log("Trying to read error.message");
  try {
    console.log(error.message);
  } catch (e) {
    console.log("Threw when reading error.message:", e.message, e.stack);
  }
}
test();
