import { createClient } from '@insforge/sdk';
const insforge = createClient({ baseUrl: 'https://6vjqpi3p.us-west.insforge.app', anonKey: 'anon_7864b4a50094554f3a6eb708d22b6faaa29aacac30ab5c92e500955fa9c63d58' });

async function run() {
  await insforge.auth.signInWithPassword({ email: 'test_1724649887718@example.com', password: 'Password123!' });
  const { data, error } = await insforge.auth.setProfile({ data: { test_field: 'hello' } });
  
  if (error) {
    console.error("Error:", error);
    return;
  }
  
  console.log("Returned User Object Keys:", Object.keys(data.user));
  console.log("Does it have user_metadata?", 'user_metadata' in data.user);
  console.log("Does it have profile?", 'profile' in data.user);
  if (data.user.profile) console.log("Profile content:", JSON.stringify(data.user.profile).substring(0, 50));
  if (data.user.user_metadata) console.log("User Metadata content:", JSON.stringify(data.user.user_metadata).substring(0, 50));
}

run().catch(e => console.error("Caught error:", e));
