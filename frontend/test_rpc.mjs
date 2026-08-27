import { createClient } from '@insforge/sdk';
import 'dotenv/config';

const url = process.env.VITE_INSFORGE_URL;
const key = process.env.VITE_INSFORGE_ANON_KEY;
const insforge = createClient(url, key);
const res = await insforge.rpc('check_single_answer', {
    p_question_id: 'dce990fa-481f-4bef-a069-0d35a3410112',
    p_selected_option: 'A'
});
console.log(res);
