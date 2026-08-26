const error = new Error('Invalid credentials');
error.statusCode = 401;
error.error = 'AUTH_UNAUTHORIZED';

try {
  const message =
    error?.message ||
    error?.error?.message ||
    error?.error_description;
  console.log("Message:", message);
} catch (e) {
  console.log("Caught:", e.message);
}
