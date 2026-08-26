import { createClient } from '@insforge/sdk';

const insforge = createClient({
  baseUrl: 'https://6vjqpi3p.us-west.insforge.app',
  anonKey: 'anon_7864b4a50094554f3a6eb708d22b6faaa29aacac30ab5c92e500955fa9c63d58'
});

async function run() {
  const { data, error } = await insforge.database.from('users').insert([{ id: 'f87a8bba-c8b5-4b0d-b8d9-e93233827d05', role: 'STUDENT' }]).select().single();
  console.log("Insert result array:", data, error);
}
run();
