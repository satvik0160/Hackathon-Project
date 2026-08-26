const fs = require('fs');
let code = fs.readFileSync('src/services/auth.service.js', 'utf8');

code = code.replace(
  /updateProfile: async \(userData\) => \{[\s\S]*?\},/g,
  `updateProfile: async (userData) => {
    console.log("authService.updateProfile START", userData);
    const { data: authData } = await insforge.auth.getCurrentUser();
    const userId = authData?.user?.id;
    if (!userId) throw new Error('Not authenticated');

    console.log("authService.updateProfile calling setProfile");
    const { data, error } = await insforge.auth.setProfile({ data: userData });
    console.log("authService.updateProfile setProfile returned", data, error);
    if (error) throw error;

    let tableData = {};
    if (insforge.database && insforge.database.from) {
      console.log("authService.updateProfile calling database.from");
      const { data: existingData, error: selectErr } = await insforge.database.from('users').select('*').eq('id', userId).single();
      if (!selectErr && existingData) {
        tableData = existingData;
      }
    } else if (insforge.from) {
      console.log("authService.updateProfile calling insforge.from");
      const { data: existingData, error: selectErr } = await insforge.from('users').select('*').eq('id', userId).single();
      if (!selectErr && existingData) {
        tableData = existingData;
      }
    } else {
      console.log("authService.updateProfile WARNING: No from method found on insforge!");
    }

    const res = { data: { ...tableData, ...(data?.user?.user_metadata || {}) } };
    console.log("authService.updateProfile END", res);
    return res;
  },`
);

fs.writeFileSync('src/services/auth.service.js', code);
