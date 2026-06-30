require('dotenv').config({ path: 'web-react/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const farmId = 'FARM-001'; // Default
  // Insert Employees
  const { data: employees, error: empErr } = await supabase.from('employees').insert([
    { full_name: 'Nguyễn Văn A', job_title: 'Kỹ thuật viên', farm_id: farmId },
    { full_name: 'Trần Thị B', job_title: 'Công nhân vệ sinh', farm_id: farmId },
    { full_name: 'Lê Văn C', job_title: 'Bảo vệ', farm_id: farmId }
  ]).select();
  if (empErr) console.error('Emp error', empErr);

  // Insert a Plan
  const planDate = new Date().toISOString().split('T')[0];
  const { data: plan, error: planErr } = await supabase.from('daily_work_plans').insert([
    { farm_id: farmId, plan_date: planDate, notes: 'Kế hoạch test' }
  ]).select();
  if (planErr) console.error('Plan error', planErr);

  console.log('Seeded employees:', employees);
  console.log('Seeded plan:', plan);
}
run();
