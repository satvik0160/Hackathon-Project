import { insforge } from './frontend/src/services/insforgeClient.js';
import dotenv from 'dotenv';
dotenv.config({ path: './frontend/.env.local' });

async function test() {
  console.log("Calling insforge edge function...");
  const { data, error } = await insforge.functions.invoke('ai_copilot', {
    body: { action: 'resume_tailor', payload: { resume_text: 'My resume text', target_role: 'Developer' } }
  });
  console.log("Data:", data);
  console.log("Error:", error);
}

test();
