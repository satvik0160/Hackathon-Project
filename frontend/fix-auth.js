const fs = require('fs');
const file = '/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/contexts/AuthContext.jsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/setUser\(res\.data\[0\] \|\| res\.data\);/g, `
    try {
      console.log("res.data type:", typeof res.data, Array.isArray(res.data));
      setUser(res.data[0] || res.data);
    } catch (e) {
      console.error("CATCH IN SET USER:", e.message);
      throw e;
    }
`);

fs.writeFileSync(file, code);
