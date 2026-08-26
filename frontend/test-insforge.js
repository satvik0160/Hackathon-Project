import { createClient } from '@insforge/sdk';
const insforge = createClient({ baseUrl: 'http://foo', anonKey: 'bar' });
console.log(typeof insforge.from);
