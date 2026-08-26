import { createClient } from '@insforge/sdk';
const insforge = createClient({ baseUrl: 'https://api.insforge.dev', anonKey: 'anon-key' });
const res = insforge.auth.onAuthStateChange(() => {});
console.log(res);
