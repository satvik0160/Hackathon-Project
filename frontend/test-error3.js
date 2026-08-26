import { createClient } from '@insforge/sdk';
const insforge = createClient({ baseUrl: 'https://6vjqpi3p.us-west.insforge.app', anonKey: 'anon_7864b4a50094554f3a6eb708d22b6faaa29aacac30ab5c92e500955fa9c63d58' });
async function test() {
  const { data, error } = await insforge.auth.signInWithPassword({ email: 'testuser@example.com', password: 'password123' });
  const normalizeAuthError = (error, fallbackMessage) => {
  if (!error) return new Error(fallbackMessage);
  const message =
    error?.message ||
    error?.error?.message ||
    error?.error_description ||
    (typeof error === 'string' ? error : null) ||
    fallbackMessage;
  const wrapped = new Error(message);
  wrapped.code = error?.code || error?.error_code || error?.errorCode;
  wrapped.status = error?.status || error?.statusCode;
  wrapped.original = error;
  return wrapped;
  };
  try {
    normalizeAuthError(error, "Fallback");
    console.log("Success");
  } catch (e) {
    console.log("Failed!", e.message, e.stack);
  }
}
test();
