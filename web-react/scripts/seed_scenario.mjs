import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const { data: farm } = await supabase.from('farms').select('id').limit(1).single();
  const FARM_ID = farm?.id;
  if (!FARM_ID) {
    console.error('No farm found in DB!');
    return;
  }
  console.log('Using Farm ID:', FARM_ID);
  
  console.log('Seeding employees...');
  const emps = [
    { employee_code: 'NV-034', full_name: 'Đinh Văn Nam', job_title: 'Công nhân chuồng đẻ', department: 'Chăn nuôi', status: 'active', farm_id: FARM_ID },
    { employee_code: 'NV-021', full_name: 'Nguyễn Văn Bình', job_title: 'Công nhân cám', department: 'Chăn nuôi', status: 'active', farm_id: FARM_ID },
    { employee_code: 'NV-017', full_name: 'Trần Thị Hoa', job_title: 'Bác sĩ thú y', department: 'Thú y', status: 'active', farm_id: FARM_ID },
    { employee_code: 'NV-045', full_name: 'Lê Minh Tuấn', job_title: 'Bảo trì', department: 'Kỹ thuật', status: 'active', farm_id: FARM_ID },
    { employee_code: 'NV-052', full_name: 'Phạm Quốc Hưng', job_title: 'Công nhân nái chửa', department: 'Chăn nuôi', status: 'active', farm_id: FARM_ID },
  ];

  const empIds = {};
  for (const e of emps) {
    const { data } = await supabase.from('employees').upsert(e, { onConflict: 'employee_code' }).select('id').single();
    if (data) empIds[e.employee_code] = data.id;
  }
  
  console.log('Seeding checkpoints...');
  const chks = [
    { checkpoint_name: 'Chuồng đẻ 1', checkpoint_type: 'barn_door', farm_id: FARM_ID, zone_id: null },
    { checkpoint_name: 'Chuồng nái chửa', checkpoint_type: 'barn_door', farm_id: FARM_ID, zone_id: null },
    { checkpoint_name: 'Khu cách ly', checkpoint_type: 'isolation', farm_id: FARM_ID, zone_id: null },
    { checkpoint_name: 'Khu sát trùng', checkpoint_type: 'shower', farm_id: FARM_ID, zone_id: null },
    { checkpoint_name: 'Cổng chính', checkpoint_type: 'gate', farm_id: FARM_ID, zone_id: null }
  ];
  
  const chkIds = {};
  for (const c of chks) {
    const { data } = await supabase.from('checkpoints').insert(c).select('id').single();
    if (data) chkIds[c.checkpoint_name] = data.id;
  }

  const { data: devices } = await supabase.from('finger_scan_devices').select('id').limit(1);
  const deviceId = devices?.[0]?.id || null;

  console.log('Seeding 120 logs...');
  const logs = [];
  const now = new Date();
  
  const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randomDate = (daysAgo) => new Date(now.getTime() - (Math.random() * daysAgo * 24 * 60 * 60 * 1000));
  
  for (let i = 0; i < 120; i++) {
    // Force some Nam records and some Chuong De 1 records
    const isNam = i < 60; // 50% Nam
    const isChuongDe = i % 3 === 0; // 33% Chuong de 1
    
    const emp = isNam ? 'NV-034' : randomChoice(Object.keys(empIds));
    const chk = isChuongDe ? 'Chuồng đẻ 1' : randomChoice(Object.keys(chkIds));
    
    let decision = 'allow';
    let reason = 'Hợp lệ';
    let risk_level = 'low';
    
    const rand = Math.random();
    if (rand < 0.1) {
      decision = 'warning';
      reason = 'Sát trùng chưa đủ 15 phút';
      risk_level = 'medium';
    } else if (rand < 0.15) {
      decision = 'deny';
      reason = 'Sai khu vực phân công (Cross-contamination risk)';
      risk_level = 'critical';
    } else if (rand < 0.2 && emp === 'NV-034' && chk !== 'Chuồng đẻ 1') {
      decision = 'warning';
      reason = 'Đi vào khu vực ngoài chuồng đẻ trong ca trực';
      risk_level = 'medium';
    }

    logs.push({
      farm_id: FARM_ID,
      employee_id: empIds[emp],
      checkpoint_id: chkIds[chk],
      device_id: deviceId,
      scan_time: randomDate(30).toISOString(),
      decision,
      reason,
      risk_level
    });
  }

  const { error } = await supabase.from('finger_scan_logs').insert(logs);
  if (error) console.error('Error inserting logs:', error);
  else console.log('Successfully inserted 120 logs!');
}

seed();
