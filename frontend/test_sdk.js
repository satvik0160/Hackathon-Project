import { insforge } from './src/services/api.js';

async function test() {
  const email = "flowtest" + Date.now() + "@example.com";
  console.log("Signing up:", email);
  
  const { data: auth, error: authErr } = await insforge.auth.signUp({
    email,
    password: "password123",
    options: {
      data: { username: "tester123", full_name: "Tester" }
    }
  });
  
  if (authErr) {
    console.error("Auth error:", authErr);
    return;
  }
  
  console.log("Logged in:", auth.user.id);
  
  let { data: assessments } = await insforge.from('assessments').select('id, difficulty');
  
  const getAss = (diff) => assessments.find(a => a.difficulty.toLowerCase() === diff.toLowerCase())?.id;
  
  let beg = getAss("BEGINNER") || getAss("MEDIUM");
  let adv = getAss("ADVANCED") || getAss("HARD") || beg;
  
  const submit = async (id, name) => {
    console.log(`\nSubmitting ${name}...`);
    const { data, error } = await insforge.rpc('submit_assessment_secure', {
      p_assessment_id: id,
      p_answers: {},
      p_time_taken_seconds: 60
    });
    if (error) console.error("RPC Error:", error);
    else {
      console.log(`XP Earned: ${data.xp_earned}`);
      console.log(`Total Points: ${data.total_points}`);
      console.log(`Skill Level: ${data.skill_level}`);
      console.log(`Skill Score %: ${data.skill_score_percent}`);
    }
    return data;
  };
  
  await submit(beg, "BEGINNER/MEDIUM");
  
  for(let i=1; i<=15; i++) {
     let res = await submit(adv, `ADVANCED (iter ${i})`);
     if (res && res.skill_level > 1) {
       console.log("\n!!! LEVEL UP DETECTED !!!");
       break;
     }
  }
}

test();
