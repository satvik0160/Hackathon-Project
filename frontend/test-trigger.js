import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:8e5f989d41560237760d1b5610c9b49e@6vjqpi3p.us-west.database.insforge.app:5432/insforge?sslmode=require',
});

async function run() {
  await client.connect();
  const res = await client.query(`
    CREATE OR REPLACE FUNCTION auth.auto_verify_user()
    RETURNS trigger AS $$
    BEGIN
      NEW.email_verified = true;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS auto_verify_user_trigger ON auth.users;

    CREATE TRIGGER auto_verify_user_trigger
    BEFORE INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auth.auto_verify_user();
  `);
  console.log('Created trigger:', res);
  await client.end();
}
run();
