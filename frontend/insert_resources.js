import { createClient } from '@insforge/sdk';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const url = process.env.VITE_INSFORGE_URL;
const key = process.env.VITE_INSFORGE_ANON_KEY || process.env.VITE_INSFORGE_KEY;
const insforge = createClient(url, key);

async function run() {
  const resources = [
    { id: 'devastra-res-1', title: 'DevAstra Written Curriculum (GFG/W3S)', description: 'Comprehensive written curriculum covering GeeksforGeeks and W3Schools material.', resource_type: 'Article', difficulty_level: 'Intermediate', skill_category: 'Curriculum', duration: 'Self-paced', url: '/resources/DevAstra_Written_GFG_W3S_Final_Fixed.pdf', completed: false },
    { id: 'devastra-res-2', title: 'DevAstra YouTube Master Curriculum', description: 'Master curriculum pulling the best learning paths from YouTube.', resource_type: 'Video', difficulty_level: 'Beginner', skill_category: 'Curriculum', duration: 'Self-paced', url: '/resources/DevAstra_YouTube_Master_Curriculum.pdf', completed: false }
  ];

  const dbClient = insforge.database ? insforge.database : insforge;
  const { data, error } = await dbClient.from('learning_resources').upsert(resources);
  
  if (error) {
    console.log("DB Insert error (okay, handled by fallback):", error);
  } else {
    console.log("Successfully inserted into InsForge DB!");
  }
}
run();
