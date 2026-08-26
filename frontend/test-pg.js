import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:8e5f989d41560237760d1b5610c9b49e@6vjqpi3p.us-west.database.insforge.app:5432/insforge?sslmode=require',
});

async function run() {
  await client.connect();
  const res = await client.query('UPDATE auth.users SET email_verified = true WHERE email_verified = false;');
  console.log('Updated users:', res.rowCount);
  await client.end();
}
run();
