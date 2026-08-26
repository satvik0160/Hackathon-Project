const apiKey = process.env.GEMINI_API_KEY;
async function test() {
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro-latest', 'gemini-1.5-flash-latest'];
  for (const model of models) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
    });
    console.log(model, res.status);
    if (res.status === 200) {
      console.log(await res.json());
      break;
    }
  }
}
test();
