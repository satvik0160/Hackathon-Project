import { authService } from './src/services/api.js';

async function run() {
  try {
    await authService.login({ identifier: 'nonexistent123@example.com', password: 'wrong' });
  } catch (err) {
    console.log("Caught:", err.message);
  }
}
run();
