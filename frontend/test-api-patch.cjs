const fs = require('fs');
let code = fs.readFileSync('src/services/api.js', 'utf8');

if (!code.includes('insforge.from = insforge.database.from')) {
  code = code.replace(
    /export const insforge = createClient\(\{[^}]+\}\);/g,
    `export const insforge = createClient({
  baseUrl: INSFORGE_URL || 'https://api.insforge.dev',
  anonKey: INSFORGE_ANON_KEY || 'public-anon-key-placeholder'
});

// Polyfill from for older code expecting it on the root client
if (insforge.database && insforge.database.from && !insforge.from) {
  insforge.from = insforge.database.from.bind(insforge.database);
}`
  );
  fs.writeFileSync('src/services/api.js', code);
}
