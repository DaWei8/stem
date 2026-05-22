const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
  if (match) {
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing supabase credentials", { supabaseUrl, supabaseServiceKey });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data: projects, error: projErr } = await supabase.from('projects').select('id, name');
  if (projErr) {
    console.error("Projects error:", projErr);
    return;
  }
  console.log("PROJECTS:", projects);

  for (const proj of projects) {
    console.log(`\n--- Project: ${proj.name} (${proj.id}) ---`);
    const { data: constants, error: constErr } = await supabase.from('constants').select('*').eq('project_id', proj.id);
    if (constErr) {
      console.error("Constants error:", constErr);
    } else {
      console.log("CONSTANTS:");
      constants.forEach(c => {
        console.log(` - ID: ${c.id}, Name: "${c.name}", Type: "${c.type}", Value: ${JSON.stringify(c.value)}`);
      });
    }

    const { data: functions, error: funcErr } = await supabase.from('functions').select('*').eq('project_id', proj.id);
    if (funcErr) {
      console.error("Functions error:", funcErr);
    } else {
      console.log("FUNCTIONS:");
      functions.forEach(f => {
        console.log(` - ID: ${f.id}, Name: "${f.name}", ReturnType: "${f.return_type}", Parameters: ${JSON.stringify(f.parameters)}`);
      });
    }
  }
}

run();
