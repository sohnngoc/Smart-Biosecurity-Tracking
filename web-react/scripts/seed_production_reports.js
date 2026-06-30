import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const farmId = 'f0000000-0000-0000-0000-000000000004';
  console.log(`Using Farm ID: ${farmId}`);

  // We will generate data for Weeks 1 to 26 of 2026
  const year = 2026;
  
  // Clean up existing data for this farm and year to avoid duplicates
  console.log('Cleaning existing data...');
  await supabase.from('production_weekly_reports').delete().eq('farm_id', farmId).eq('year', year);
  await supabase.from('breeding_weekly_metrics').delete().eq('farm_id', farmId).eq('year', year);
  await supabase.from('farrowing_weekly_metrics').delete().eq('farm_id', farmId).eq('year', year);
  await supabase.from('piglet_mortality_weekly').delete().eq('farm_id', farmId).eq('year', year);
  await supabase.from('piglet_export_weekly').delete().eq('farm_id', farmId).eq('year', year);
  await supabase.from('production_targets').delete().eq('farm_id', farmId).eq('year', year);

  console.log('Seeding targets...');
  const targets = [
    { metric_code: 'boars', metric_name: 'Số nọc hoạt động', std_value: 45, unit: 'con', direction: 'target_range' },
    { metric_code: 'productive_sows', metric_name: 'Số nái sinh sản', std_value: 2000, unit: 'con', direction: 'target_range' },
    { metric_code: 'gilts', metric_name: 'Số nái hậu bị', std_value: 300, unit: 'con', direction: 'target_range' },
    { metric_code: 'total_herd', metric_name: 'Tổng đàn', std_value: 2345, unit: 'con', direction: 'target_range' },
    
    { metric_code: 'actual_count', metric_name: 'Số nái được phối', std_value: 105, unit: 'con', direction: 'higher_is_better' },
    { metric_code: 'actual_rate', metric_name: 'Tỷ lệ phối so với chỉ tiêu', std_value: 100, unit: '%', direction: 'higher_is_better' },
    { metric_code: 'preg_4_weeks', metric_name: 'Mang thai 4 tuần', std_value: 95, unit: '%', direction: 'higher_is_better' },
    { metric_code: 'preg_7_weeks', metric_name: 'Mang thai 7 tuần', std_value: 93, unit: '%', direction: 'higher_is_better' },
    { metric_code: 'preg_10_weeks', metric_name: 'Mang thai 10 tuần', std_value: 91, unit: '%', direction: 'higher_is_better' },
    { metric_code: 'preg_13_weeks', metric_name: 'Mang thai 13 tuần', std_value: 90, unit: '%', direction: 'higher_is_better' },
    { metric_code: 'pregnancy_rate', metric_name: 'Tỷ lệ đậu thai', std_value: 88, unit: '%', direction: 'higher_is_better' },
    
    { metric_code: 'farrowed_sows', metric_name: 'Số nái đẻ', std_value: 95, unit: 'con', direction: 'target_range' },
    { metric_code: 'total_born', metric_name: 'Tổng số heo con sinh ra', std_value: 1300, unit: 'con', direction: 'higher_is_better' },
    { metric_code: 'stillborn_rate', metric_name: 'Chết khi sinh', std_value: 10, unit: '%', direction: 'lower_is_better' },
    { metric_code: 'mummified_count', metric_name: 'Chết khô', std_value: 2, unit: '%', direction: 'lower_is_better' },
    { metric_code: 'abnormal_count', metric_name: 'Bất thường', std_value: 1, unit: '%', direction: 'lower_is_better' },
    { metric_code: 'liveborn_count', metric_name: 'Tổng số heo con sinh sống', std_value: 1100, unit: 'con', direction: 'higher_is_better' },
    { metric_code: 'liveborn_per_sow', metric_name: 'Số con sinh sống/nái', std_value: 11.5, unit: 'con', direction: 'higher_is_better' },
    
    { metric_code: 'dead_under_sow_rate', metric_name: 'Heo chết & loại sau sinh theo mẹ', std_value: 4, unit: '%', direction: 'lower_is_better' },
    { metric_code: 'dead_after_weaning_rate', metric_name: 'Heo chết & loại sau sinh cai sữa', std_value: 1, unit: '%', direction: 'lower_is_better' },
    { metric_code: 'export_actual', metric_name: 'Tổng số heo con cai sữa', std_value: 1050, unit: 'con', direction: 'higher_is_better' },
    { metric_code: 'weaned_per_sow', metric_name: 'Tổng số heo con cai sữa/nái', std_value: 11.0, unit: 'con', direction: 'higher_is_better' },
    { metric_code: 'total_dead_rate', metric_name: 'Tỷ lệ chết & loại sau sinh', std_value: 5, unit: '%', direction: 'lower_is_better' },
    
    { metric_code: 'piglet_feed_total_kg', metric_name: 'Thức ăn bình quân heo con', std_value: 1000, unit: 'kg', direction: 'lower_is_better' },
    { metric_code: 'feed_sow_total', metric_name: 'Thức ăn nái/nọc', std_value: 45000, unit: 'kg', direction: 'lower_is_better' },
    { metric_code: 'feed_sow_avg_kg_day', metric_name: 'Khẩu phần bình quân kg/con/ngày', std_value: 2.55, unit: 'kg', direction: 'lower_is_better' },
    
    { metric_code: 'litters_per_sow_year', metric_name: 'Số lứa đẻ/nái/năm', std_value: 2.4, unit: 'lứa', direction: 'higher_is_better' },
    { metric_code: 'weaned_per_sow_year', metric_name: 'Số heo con cai sữa/nái/năm', std_value: 26.4, unit: 'con', direction: 'higher_is_better' },
    { metric_code: 'cull_rate', metric_name: 'Tỷ lệ loại thải nái/hậu bị', std_value: 30, unit: '%', direction: 'lower_is_better' }
  ];

  for (const t of targets) {
    await supabase.from('production_targets').insert({
      farm_id: farmId, year, category: 'General', ...t
    });
  }

  console.log('Seeding 26 weeks...');

  for (let week = 1; week <= 26; week++) {
    const isTargetWeek = (week === 26);
    
    // Dates pseudo-logic
    // For week 26: 21/6/2026 - 27/6/2026
    const period_start = new Date(2026, 0, (week - 1) * 7 + 1).toISOString().split('T')[0];
    const period_end = new Date(2026, 0, week * 7).toISOString().split('T')[0];

    // Data generation
    let total_herd, productive_sows, gilts, boars, batch_888_total, batch_888_old, batch_888_new;
    let feed_sow_total, feed_sow_avg_kg_day, piglet_feed_total_kg;
    let plan_count, actual_count, breeding_target_count, from_weaned_sows, from_gilts, from_rebreeding, problem_sows, actual_rate, delta_vs_target;
    let weaned_sows, rebreeding_rate, cause_anestrus, cause_purulent, cause_lame, cause_no_heat, cause_dead, cause_weak, cause_other;
    let farrowed_sows, total_born, stillborn_count, liveborn_count, born_per_sow, stillborn_rate, liveborn_per_sow, mummified_count, abnormal_count;
    let dead_under_sow, dead_under_sow_rate, dead_after_weaning, dead_after_weaning_rate, total_dead, total_dead_rate;
    let export_plan, export_actual, export_balance, avg_weight, weaned_per_sow_year, litters_per_sow_year;
    let preg_4_weeks, preg_7_weeks, preg_10_weeks, preg_13_weeks, pregnancy_rate, cull_rate;
    let end_inventory, receiver_farm, ticket_count, ticket_status, reason_sow_delay, reason_transport, reason_gilt_delay;

    if (isTargetWeek) {
      // Hardcoded for week 26
      total_herd = 2382;
      productive_sows = 1998;
      gilts = 317;
      boars = 45;
      batch_888_total = 22; batch_888_old = 0; batch_888_new = 22;
      feed_sow_total = 46310; feed_sow_avg_kg_day = 2.777; piglet_feed_total_kg = 2240;
      
      breeding_target_count = 104.895; plan_count = 136; actual_count = 138;
      from_weaned_sows = 87; from_gilts = 51; from_rebreeding = 0; problem_sows = 0;
      delta_vs_target = 33.105; actual_rate = 6.91; // %
      preg_4_weeks = 94; preg_7_weeks = 93; preg_10_weeks = 92; preg_13_weeks = 90; pregnancy_rate = 89;

      weaned_sows = 100; rebreeding_rate = 87;
      cause_anestrus = 2; cause_purulent = 3; cause_lame = 1; cause_no_heat = 4; cause_dead = 1; cause_weak = 2; cause_other = 0;

      farrowed_sows = 103; total_born = 1668; born_per_sow = 16.19;
      stillborn_count = 290; stillborn_rate = 17.39; // %
      liveborn_count = 1378; liveborn_per_sow = 13.38;
      mummified_count = 20; abnormal_count = 10;

      dead_under_sow = 68; dead_under_sow_rate = 4.93;
      dead_after_weaning = 6; dead_after_weaning_rate = 0.44;
      total_dead = 74; total_dead_rate = 5.37;

      export_plan = 1200; export_actual = 1202; export_balance = 2; avg_weight = 6.16;
      weaned_per_sow_year = 26.5; litters_per_sow_year = 2.45; cull_rate = 28;
      
      end_inventory = 150; receiver_farm = 'Trại thịt Hòa Bình';
      ticket_count = 3; ticket_status = 'Chốt đủ';
      reason_sow_delay = 0; reason_transport = 0; reason_gilt_delay = 0;

    } else {
      // Trend simulation for weeks 1-25
      const trendOscillation = Math.sin(week / 4) * 0.1; 
      const trendGrowth = (week / 26) * 0.05;

      total_herd = Math.floor(2300 + trendOscillation * 100 + trendGrowth * 100);
      productive_sows = Math.floor(total_herd * 0.85);
      gilts = Math.floor(total_herd * 0.13);
      boars = Math.floor(total_herd * 0.02);
      batch_888_total = Math.floor(20 + Math.random() * 5);
      batch_888_old = Math.floor(Math.random() * 5);
      batch_888_new = batch_888_total - batch_888_old;

      feed_sow_avg_kg_day = 2.5 + Math.random() * 0.3;
      feed_sow_total = Math.floor(productive_sows * feed_sow_avg_kg_day * 7);
      piglet_feed_total_kg = 2000 + Math.random() * 500;

      breeding_target_count = 100 + Math.floor(Math.random() * 10);
      plan_count = 100 + Math.floor(Math.random() * 40);
      actual_count = 80 + Math.floor(Math.random() * 60);
      from_weaned_sows = Math.floor(actual_count * 0.7);
      from_gilts = actual_count - from_weaned_sows;
      from_rebreeding = Math.floor(Math.random() * 5);
      problem_sows = Math.floor(Math.random() * 5);
      delta_vs_target = actual_count - breeding_target_count;
      actual_rate = parseFloat(((actual_count / productive_sows) * 100).toFixed(2));

      farrowed_sows = 80 + Math.floor(Math.random() * 30);
      total_born = farrowed_sows * (14 + Math.random() * 3);
      born_per_sow = parseFloat((total_born / farrowed_sows).toFixed(2));
      stillborn_rate = 10 + Math.random() * 4; // Normal: 10-14%
      stillborn_count = Math.floor(total_born * (stillborn_rate / 100));
      liveborn_count = total_born - stillborn_count;
      liveborn_per_sow = parseFloat((liveborn_count / farrowed_sows).toFixed(2));

      dead_under_sow = Math.floor(liveborn_count * (0.02 + Math.random() * 0.03));
      dead_under_sow_rate = parseFloat(((dead_under_sow / liveborn_count) * 100).toFixed(2));
      dead_after_weaning = Math.floor(Math.random() * 10);
      dead_after_weaning_rate = parseFloat(((dead_after_weaning / liveborn_count) * 100).toFixed(2));
      total_dead = dead_under_sow + dead_after_weaning;
      total_dead_rate = parseFloat(((total_dead / liveborn_count) * 100).toFixed(2));

      export_plan = 600 + Math.floor(Math.random() * 1700); // 600-2300
      export_actual = Math.floor(export_plan * (0.9 + Math.random() * 0.2));
      export_balance = export_actual - export_plan;
      avg_weight = 5.5 + Math.random() * 1.7; // 5.5 - 7.2
      
      const unexported = Math.max(0, export_plan - export_actual);
      end_inventory = 100 + Math.floor(Math.random() * 300) + unexported;
      receiver_farm = Math.random() > 0.5 ? 'Trại thịt Hòa Bình' : 'Trại thịt Phú Thọ';
      ticket_count = Math.floor(export_actual / 400) + 1;
      ticket_status = unexported > 50 ? 'Thiếu phiếu' : 'Chốt đủ';
      reason_sow_delay = Math.floor(unexported * 0.4);
      reason_transport = Math.floor(unexported * 0.3);
      reason_gilt_delay = unexported - reason_sow_delay - reason_transport;

      weaned_per_sow_year = 25 + Math.random() * 2;
      litters_per_sow_year = 2.3 + Math.random() * 0.2;
      cull_rate = 25 + Math.random() * 10;
      preg_4_weeks = 92 + Math.random() * 5;
      preg_7_weeks = 91 + Math.random() * 5;
      preg_10_weeks = 90 + Math.random() * 5;
      preg_13_weeks = 89 + Math.random() * 5;
      pregnancy_rate = 88 + Math.random() * 5;
      mummified_count = Math.floor(total_born * 0.01);
      abnormal_count = Math.floor(total_born * 0.005);
      
      weaned_sows = Math.floor(farrowed_sows * 0.95);
      rebreeding_rate = 80 + Math.random() * 15;
      cause_anestrus = Math.floor(Math.random() * 3);
      cause_purulent = Math.floor(Math.random() * 3);
      cause_lame = Math.floor(Math.random() * 2);
      cause_no_heat = Math.floor(Math.random() * 3);
      cause_dead = Math.floor(Math.random() * 2);
      cause_weak = Math.floor(Math.random() * 2);
      cause_other = Math.floor(Math.random() * 2);
    }

    // Insert 1: production_weekly_reports
    await supabase.from('production_weekly_reports').insert({
      farm_id: farmId, year, week_no: week, period_start, period_end,
      total_herd, productive_sows, gilts, boars, batch_888_total, batch_888_old, batch_888_new,
      feed_sow_total, feed_sow_avg_kg_day: parseFloat(feed_sow_avg_kg_day.toFixed(3)), piglet_feed_total_kg,
      litters_per_sow_year: parseFloat(litters_per_sow_year.toFixed(2)), weaned_per_sow_year: parseFloat(weaned_per_sow_year.toFixed(2)),
      cull_rate: parseFloat(cull_rate.toFixed(2))
    });

    // Insert 2: breeding_weekly_metrics
    await supabase.from('breeding_weekly_metrics').insert({
      farm_id: farmId, year, week_no: week,
      target_count: parseFloat(breeding_target_count.toFixed(3)), plan_count, actual_count,
      from_weaned_sows, from_gilts, from_rebreeding, problem_sows, delta_vs_target: parseFloat(delta_vs_target.toFixed(3)), actual_rate,
      preg_4_weeks: parseFloat(preg_4_weeks.toFixed(2)), preg_7_weeks: parseFloat(preg_7_weeks.toFixed(2)),
      preg_10_weeks: parseFloat(preg_10_weeks.toFixed(2)), preg_13_weeks: parseFloat(preg_13_weeks.toFixed(2)),
      pregnancy_rate: parseFloat(pregnancy_rate.toFixed(2)),
      weaned_sows, rebreeding_rate: parseFloat(rebreeding_rate.toFixed(2)),
      cause_anestrus, cause_purulent, cause_lame, cause_no_heat, cause_dead, cause_weak, cause_other
    });

    // Insert 3: farrowing_weekly_metrics
    await supabase.from('farrowing_weekly_metrics').insert({
      farm_id: farmId, year, week_no: week,
      farrowed_sows, total_born, born_per_sow, stillborn_count, stillborn_rate: parseFloat(stillborn_rate.toFixed(2)),
      liveborn_count, liveborn_per_sow, mummified_count, abnormal_count
    });

    // Insert 4: piglet_mortality_weekly
    await supabase.from('piglet_mortality_weekly').insert({
      farm_id: farmId, year, week_no: week,
      dead_under_sow, dead_under_sow_rate, dead_after_weaning, dead_after_weaning_rate,
      total_dead, total_dead_rate
    });

    // Insert 5: piglet_export_weekly
    await supabase.from('piglet_export_weekly').insert({
      farm_id: farmId, year, week_no: week,
      export_plan, export_actual, export_balance, avg_weight: parseFloat(avg_weight.toFixed(2)),
      end_inventory, receiver_farm, ticket_count, ticket_status, 
      reason_sow_delay, reason_transport, reason_gilt_delay
    });

    // Insert 6: feed_orders
    // Random 3-5 orders per week
    const numOrders = Math.floor(Math.random() * 3) + 3;
    const products = [
      '550PF 10kg', '550SF 40kg', '551FS54 40kg', '551GPF S54 40kg',
      '551GPF S13 40kg', '552SF', '552SFS90', '552F', '552FS90',
      '552FS13', '562F', '562FS90', '562PF', '562PFS90', '566F',
      '566FS90', '567SF', '567SFS90'
    ];
    const vehicles = ['29H-35555', '29C-71587', '36C-12345', '89C-98765'];
    
    // MOCK CULLING REQUESTS
    const cullingReasons = ['Lốc mủ', 'Sảy thai', 'Không thai', 'Viêm mủ', 'Sản xuất kém', 'Già', 'Đau chân', 'Tinh yếu', 'Khô thai', 'Chết', 'Vấn đề khác'];
    const pigTypes = ['Nái', 'Hậu bị', 'Nọc', 'W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'];
    const statuses = ['Draft', 'Submitted', 'Vet Approved', 'Rejected', 'Completed'];
    const numCulls = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < numCulls; i++) {
        await supabase.from('culling_requests').insert({
          farm_id: farmId,
          year,
          week_no: week,
          ear_tag: `TAG-${Math.floor(Math.random() * 9000) + 1000}`,
          parity: Math.floor(Math.random() * 8),
          pig_type: pigTypes[Math.floor(Math.random() * pigTypes.length)],
          reason: cullingReasons[Math.floor(Math.random() * cullingReasons.length)],
          issue_date: new Date(new Date(period_start).getTime() + (Math.random() * 6 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          batch_888_date: new Date(new Date(period_start).getTime() + 86400000 * 7).toISOString().split('T')[0],
          creator: 'Nguyễn Văn A',
          status: statuses[Math.floor(Math.random() * statuses.length)]
        });
    }
    
    for (let i = 0; i < numOrders; i++) {
      const isPending = Math.random() > 0.8;
      const product = products[Math.floor(Math.random() * products.length)];
      const weight = product.includes('10kg') ? 10 : (product.includes('40kg') ? 40 : 25);
      const bag_count = Math.floor(Math.random() * 100) + 50;
      
      await supabase.from('feed_orders').insert({
        farm_id: farmId, year, week_no: week,
        order_date: new Date(new Date(period_start).getTime() + (Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        manager: 'Nguyễn Văn A',
        vehicle_plate: vehicles[Math.floor(Math.random() * vehicles.length)],
        farm_code: 'F004',
        farm_group: 'Bắc Bộ',
        factory: 'Nhà máy Cám Hà Nam',
        transporter: 'Vận tải ABC',
        product_code: product,
        bag_weight_kg: weight,
        bag_count: bag_count,
        total_kg: bag_count * weight,
        po_number: `PO-${year}-${week}-${Math.floor(Math.random() * 1000)}`,
        note: Math.random() > 0.5 ? 'SILO 1' : 'SILO 2',
        biosecurity_status: isPending ? 'Pending' : 'Approved'
      });
    }

    // MOCK VACCINE SCHEDULES
    await supabase.from('vaccine_schedules').delete().eq('farm_id', farmId).eq('year', year).eq('week_no', week); // Ensure clean insert for this block
    const vaxStatuses = ['Planned', 'Due Soon', 'Overdue', 'Done'];
    const staffList = ['Nguyễn Văn A', 'Lê Thị B', 'Trần Văn C', 'Phạm Minh D'];

    // 1. Heo Nái
    const naiVaccines = ['SFV', 'FMD', 'FED', 'CIRCO'];
    const naiCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < naiCount; i++) {
        await supabase.from('vaccine_schedules').insert({
          farm_id: farmId, year, week_no: week,
          pig_type: 'Heo nái',
          batch_name: `Lô Nái ${Math.floor(Math.random() * 100)}`,
          vaccine_type: naiVaccines[Math.floor(Math.random() * naiVaccines.length)],
          quantity: Math.floor(Math.random() * 50) + 10,
          status: vaxStatuses[Math.floor(Math.random() * vaxStatuses.length)],
          notes: JSON.stringify({
            tp: `Tuần ${Math.floor(Math.random() * 52) + 1}`,
            staff: staffList[Math.floor(Math.random() * staffList.length)]
          })
        });
    }

    // 2. Heo Đực cà
    const ducCaVaccines = ['SFV', 'FMD', 'AD', 'CIRCO'];
    const ducCaCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < ducCaCount; i++) {
        await supabase.from('vaccine_schedules').insert({
          farm_id: farmId, year, week_no: week,
          pig_type: 'Heo đực cà',
          batch_name: `Lô Đực cà ${Math.floor(Math.random() * 50)}`,
          vaccine_type: ducCaVaccines[Math.floor(Math.random() * ducCaVaccines.length)],
          quantity: Math.floor(Math.random() * 10) + 2,
          status: vaxStatuses[Math.floor(Math.random() * vaxStatuses.length)],
          notes: JSON.stringify({
            tp: `Tuần ${Math.floor(Math.random() * 52) + 1}`,
            staff: staffList[Math.floor(Math.random() * staffList.length)]
          })
        });
    }

    // 3. Heo con
    const heoConVaccines = ['hyogen', 'CIRCO'];
    const heoConCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < heoConCount; i++) {
        await supabase.from('vaccine_schedules').insert({
          farm_id: farmId, year, week_no: week,
          pig_type: 'Heo con',
          batch_name: `Lô Heo con ${Math.floor(Math.random() * 200)}`,
          vaccine_type: heoConVaccines[Math.floor(Math.random() * heoConVaccines.length)],
          quantity: Math.floor(Math.random() * 200) + 50,
          status: vaxStatuses[Math.floor(Math.random() * vaxStatuses.length)],
          notes: JSON.stringify({
            tt: `Tuần ${Math.floor(Math.random() * 41) + 1}`,
            staff: staffList[Math.floor(Math.random() * staffList.length)]
          })
        });
    }

    // MOCK GILT BATCHES
    // Maybe 1 batch every 4 weeks
    if (week % 4 === 0) {
        await supabase.from('gilt_batches').insert({
          farm_id: farmId, year, week_no: week,
          batch_month: `Tháng ${Math.ceil(week/4)}/${year}`,
          import_count: Math.floor(Math.random() * 50) + 30,
          avg_import_age: 180 + Math.floor(Math.random() * 20),
          source_farm: 'Trại giống Đồng Nai',
          dead_count: Math.floor(Math.random() * 3),
          cull_count: Math.floor(Math.random() * 5),
          bred_count: Math.floor(Math.random() * 20) + 10,
          avg_bred_age: 220 + Math.floor(Math.random() * 20),
          remaining_count: 0, // calculate later if needed
          notes: 'Nhập bổ sung đàn'
        });
    }

    // MOCK HERD GROWTH PLANS
    await supabase.from('herd_growth_plans').insert({
      farm_id: farmId, year, week_no: week,
      scale: 2400,
      target_productive_sows: 2200,
      actual_productive_sows: productive_sows,
      current_gilts: gilts,
      gilt_increase: Math.floor(Math.random() * 10),
      total_herd: total_herd,
      total_herd_increase: Math.floor(Math.random() * 50) - 20, // can be negative
      target_achieved_pct: (productive_sows / 2200) * 100,
      gilt_imported: week % 4 === 0 ? Math.floor(Math.random() * 50) + 30 : 0,
      sows_bred: Math.floor(Math.random() * 40) + 60
    });
  }

  console.log('Seeding completed successfully!');
}

seed().catch(console.error);
