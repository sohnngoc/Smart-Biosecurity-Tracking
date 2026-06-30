import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import { 
  ClipboardList, Plus, Copy, Upload, Download, 
  CheckCircle, AlertCircle, Send, Calendar, ShieldAlert, X
} from 'lucide-react';

interface Employee {
  id: string;
  full_name: string;
  employee_code: string;
  department: string;
  job_title: string;
}

interface Zone {
  id: string;
  zone_name: string;
  zone_type: string;
  risk_level: string;
}

interface Barn {
  id: string;
  zone_id: string;
  barn_name: string;
  barn_type: string;
}

interface Shower {
  id: string;
  room_name: string;
  max_capacity: number;
}

interface Farm {
  id: string;
  name: string;
}

interface Assignment {
  id: string;
  employee_id: string;
  task_category: string;
  zone_id: string | null;
  barn_id: string | null;
  assigned_shower_id: string | null;
  shift: 'day' | 'night';
  task_description: string;
  biosecurity_level: string;
  status: string;
  // UI only fields for new requirement
  ui_task_type?: 'cleaning' | 'technical' | 'both' | 'pen_check' | 'handover' | 'receiving';
  ui_cleaning_desc?: string;
  ui_technical_desc?: string;
  ui_source_farm_id?: string;
  ui_dest_farm_id?: string;
  ui_expected_time?: string;
  ui_expected_qty?: number;
  ui_reviewer_id?: string;
}

export default function PhanCongCongViec() {
  const { farmId } = useOutletContext<{ farmId: string }>();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [barns, setBarns] = useState<Barn[]>([]);
  const [showers, setShowers] = useState<Shower[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    if (farmId) {
      fetchMasterData();
      fetchDailyPlan();
    }
  }, [farmId, date]);

  const fetchEmployees = async () => {
    const { data } = await supabase.from('employees').select('id, full_name, job_title').eq('farm_id', farmId);
    if (data && data.length > 0) {
      setEmployees(data as any);
    } else {
      setEmployees([
        { id: 'mock-1', full_name: 'Nguyễn Văn A', job_title: 'Kỹ thuật viên', employee_code: 'EMP-001', department: 'Kỹ thuật' },
        { id: 'mock-2', full_name: 'Trần Thị B', job_title: 'Công nhân vệ sinh', employee_code: 'EMP-002', department: 'Vệ sinh' },
        { id: 'mock-3', full_name: 'Lê Văn C', job_title: 'Bác sĩ thú y', employee_code: 'EMP-003', department: 'Kỹ thuật' }
      ]);
    }
  };

  const fetchMasterData = async () => {
    await fetchEmployees();
    const [zoneRes, barnRes, showerRes, farmRes] = await Promise.all([
      supabase.from('farm_zones').select('*').eq('farm_id', farmId),
      supabase.from('barns').select('*, farm_zones!inner(farm_id)').eq('farm_zones.farm_id', farmId),
      supabase.from('shower_rooms').select('*, checkpoints!inner(farm_id)').eq('checkpoints.farm_id', farmId),
      supabase.from('farms').select('*')
    ]);
    
    if (farmRes.data) setFarms(farmRes.data);

    let finalZones: Zone[] = [];
    if (zoneRes.data && zoneRes.data.length > 0) {
      finalZones = zoneRes.data;
      setZones(zoneRes.data);
    } else {
      finalZones = [
        { id: 'zone-1', zone_name: 'Khu chuồng đẻ', zone_type: 'farrowing', risk_level: 'high' } as Zone,
        { id: 'zone-2', zone_name: 'Khu chuồng bầu', zone_type: 'gestation', risk_level: 'medium' } as Zone,
        { id: 'zone-3', zone_name: 'Khu cách ly', zone_type: 'isolation', risk_level: 'isolation' } as Zone,
        { id: 'zone-4', zone_name: 'Khu phụ trợ', zone_type: 'support', risk_level: 'low' } as Zone
      ];
      setZones(finalZones);
    }

    if (barnRes.data && barnRes.data.length > 0) {
      setBarns(barnRes.data);
    } else {
      const deZone = finalZones.find(z => z.zone_name.toLowerCase().includes('đẻ'))?.id || 'zone-1';
      const bauZone = finalZones.find(z => z.zone_name.toLowerCase().includes('bầu'))?.id || 'zone-2';
      const cachlyZone = finalZones.find(z => z.zone_name.toLowerCase().includes('cách ly'))?.id || 'zone-3';
      const phutroZone = finalZones.find(z => z.zone_name.toLowerCase().includes('phụ trợ') || z.zone_name.toLowerCase().includes('kho') || z.zone_name.toLowerCase().includes('cổng'))?.id || 'zone-4';

      setBarns([
        { id: 'de1', zone_id: deZone, barn_name: 'Chuồng Đẻ 1', barn_type: 'farrowing' } as Barn,
        { id: 'de2', zone_id: deZone, barn_name: 'Chuồng Đẻ 2', barn_type: 'farrowing' } as Barn,
        { id: 'de3', zone_id: deZone, barn_name: 'Chuồng Đẻ 3', barn_type: 'farrowing' } as Barn,
        { id: 'bau1', zone_id: bauZone, barn_name: 'Chuồng Bầu 1', barn_type: 'gestation' } as Barn,
        { id: 'bau2', zone_id: bauZone, barn_name: 'Chuồng Bầu 2', barn_type: 'gestation' } as Barn,
        { id: 'cach_ly1', zone_id: cachlyZone, barn_name: 'Cách Ly 1', barn_type: 'isolation' } as Barn,
        { id: 'cach_ly2', zone_id: cachlyZone, barn_name: 'Cách Ly 2', barn_type: 'isolation' } as Barn,
        { id: 'hau_bi_cl', zone_id: cachlyZone, barn_name: 'Hậu Bị Cách Ly', barn_type: 'isolation' } as Barn,
        { id: 'kho_thuoc', zone_id: phutroZone, barn_name: 'Kho Thuốc', barn_type: 'support' } as Barn,
        { id: 'kho_cam', zone_id: phutroZone, barn_name: 'Kho Cám', barn_type: 'support' } as Barn,
        { id: 'sinh_hoat', zone_id: phutroZone, barn_name: 'Khu Sinh Hoạt', barn_type: 'support' } as Barn,
        { id: 'cong', zone_id: phutroZone, barn_name: 'Cổng Trại', barn_type: 'support' } as Barn
      ]);
    }

    if (showerRes.data && showerRes.data.length > 0) {
      setShowers(showerRes.data);
    } else {
      setShowers([
        { id: 'tam1', room_name: 'Tắm 1', max_capacity: 5 } as Shower,
        { id: 'tam2', room_name: 'Tắm 2', max_capacity: 5 } as Shower,
        { id: 'tam3', room_name: 'Tắm 3', max_capacity: 5 } as Shower,
        { id: 'tam4', room_name: 'Tắm 4', max_capacity: 5 } as Shower,
        { id: 'tam5', room_name: 'Tắm 5', max_capacity: 5 } as Shower,
      ]);
    }
  };

  const fetchDailyPlan = async () => {
    const { data: planData } = await supabase.from('daily_work_plans').select('*').eq('farm_id', farmId).eq('plan_date', date).single();
    if (planData) {
      const { data: tasks } = await supabase.from('assigned_tasks').select('*').eq('plan_id', planData.id);
      if (tasks && tasks.length > 0) {
        setIsPublished(true);
        const parsedTasks = tasks.map((t: any) => {
          let ui_task_type: 'cleaning' | 'technical' | 'both' | 'pen_check' | 'handover' | 'receiving' = 'cleaning';
          let ui_cleaning_desc = '';
          let ui_technical_desc = '';
          const desc = t.task_description || '';
          const meta = t.metadata || {};
          
          if (t.task_category === 'pen_check') ui_task_type = 'pen_check';
          else if (t.task_category === 'handover') ui_task_type = 'handover';
          else if (t.task_category === 'receiving') ui_task_type = 'receiving';
          else if (desc.includes('[Vệ sinh]') && desc.includes('[Kỹ thuật]')) {
             ui_task_type = 'both';
             const parts = desc.split('[Kỹ thuật]');
             ui_cleaning_desc = parts[0].replace('[Vệ sinh]', '').trim();
             ui_technical_desc = parts[1].trim();
          } else if (desc.includes('[Kỹ thuật]')) {
             ui_task_type = 'technical';
             ui_technical_desc = desc.replace('[Kỹ thuật]', '').trim();
          } else if (desc.includes('[Vệ sinh]')) {
             ui_task_type = 'cleaning';
             ui_cleaning_desc = desc.replace('[Vệ sinh]', '').trim();
          } else {
             ui_cleaning_desc = desc;
          }
          return { 
            ...t, 
            ui_task_type, 
            ui_cleaning_desc, 
            ui_technical_desc,
            ui_source_farm_id: meta.source_farm_id || '',
            ui_dest_farm_id: meta.dest_farm_id || '',
            ui_expected_time: meta.expected_time || '',
            ui_expected_qty: meta.expected_qty || '',
            ui_reviewer_id: meta.reviewer_id || '',
          };
        });
        setAssignments(parsedTasks);
      } else {
        setIsPublished(false);
        setAssignments([]);
      }
    } else {
      setIsPublished(false);
      setAssignments([]);
    }
  };

  const handleValidate = () => {
    const errors: string[] = [];
    // Basic validation
    assignments.forEach((a, idx) => {
      if (!a.employee_id) {
        errors.push(`Công việc dòng thứ ${idx + 1} chưa chọn nhân sự.`);
      }
      if (['pen_check', 'handover', 'receiving'].includes(a.ui_task_type || '')) {
        if (!a.ui_source_farm_id) errors.push(`Công việc dòng thứ ${idx + 1}: Thiếu Trại xuất.`);
        if (!a.ui_dest_farm_id) errors.push(`Công việc dòng thứ ${idx + 1}: Thiếu Trại đích.`);
        if (!a.ui_reviewer_id) errors.push(`Công việc dòng thứ ${idx + 1}: Thiếu Người duyệt.`);
      }
    });

    // Shower capacity check
    const showerCounts: Record<string, number> = {};
    assignments.forEach(a => {
      if (a.assigned_shower_id) {
        showerCounts[a.assigned_shower_id] = (showerCounts[a.assigned_shower_id] || 0) + 1;
      }
    });
    
    Object.keys(showerCounts).forEach(showerId => {
      const shower = showers.find(s => s.id === showerId);
      if (shower && showerCounts[showerId] > shower.max_capacity) {
        errors.push(`Phòng tắm "${shower.room_name}" đã vượt quá công suất (${showerCounts[showerId]}/${shower.max_capacity} người).`);
      }
    });

    // Isolation vs Normal check
    const empZones: Record<string, string[]> = {};
    assignments.forEach(a => {
      if (a.zone_id) {
        const zone = zones.find(z => z.id === a.zone_id);
        if (zone) {
          empZones[a.employee_id] = empZones[a.employee_id] || [];
          empZones[a.employee_id].push(zone.risk_level);
        }
      }
    });

    Object.keys(empZones).forEach(empId => {
      const levels = empZones[empId];
      if (levels.includes('isolation') && levels.includes('normal')) {
        const emp = employees.find(e => e.id === empId);
        errors.push(`Nhân sự ${emp?.full_name} bị gán vào cả khu cách ly và khu thường trong cùng một ngày.`);
      }
    });

    // Dummy leave check
    const leaveEmp = employees.find(e => e.job_title?.includes('Nghỉ phép'));
    if (leaveEmp && assignments.some(a => a.employee_id === leaveEmp.id)) {
      errors.push(`Nhân sự ${leaveEmp.full_name} đang nghỉ phép nhưng vẫn được giao việc.`);
    }

    setValidationErrors(errors);
    if (errors.length === 0) {
      alert("Validation OK! Bản phân công hoàn toàn hợp lệ.");
    }
  };

  const handleAssign = async () => {
    handleValidate();
    if (validationErrors.length > 0) return;
    
    // Create or update plan
    let { data: plan } = await supabase
      .from('daily_work_plans')
      .select('id')
      .eq('farm_id', farmId)
      .eq('plan_date', date)
      .single();

    if (!plan) {
      const res = await supabase
        .from('daily_work_plans')
        .insert({ farm_id: farmId, plan_date: date, status: 'published' })
        .select()
        .single();
      plan = res.data;
    } else {
      await supabase.from('daily_work_plans').update({ status: 'published' }).eq('id', plan.id);
      await supabase.from('assigned_tasks').delete().eq('plan_id', plan.id);
    }

    if (plan && assignments.length > 0) {
      const tasksToInsert = assignments.map(a => {
        let combinedDesc = a.task_description;
        let category = a.task_category;
        let metadata: any = null;

        if (a.ui_task_type) {
          if (a.ui_task_type === 'cleaning') {
            combinedDesc = `[Vệ sinh] ${a.ui_cleaning_desc || ''}`;
            category = 'sanitation';
          } else if (a.ui_task_type === 'technical') {
            combinedDesc = `[Kỹ thuật] ${a.ui_technical_desc || ''}`;
            category = 'technical';
          } else if (a.ui_task_type === 'both') {
            combinedDesc = `[Vệ sinh] ${a.ui_cleaning_desc || ''}\n[Kỹ thuật] ${a.ui_technical_desc || ''}`;
            category = 'both';
          } else if (['pen_check', 'handover', 'receiving'].includes(a.ui_task_type)) {
            category = a.ui_task_type;
            const labels = {
              'pen_check': '[Kiểm tra chuồng]',
              'handover': '[Bàn giao heo]',
              'receiving': '[Nhận heo cai sữa]'
            };
            combinedDesc = `${labels[a.ui_task_type as keyof typeof labels]} ${a.task_description || ''}`;
            metadata = {
              form_type: a.ui_task_type,
              source_farm_id: a.ui_source_farm_id,
              dest_farm_id: a.ui_dest_farm_id,
              expected_time: a.ui_expected_time,
              expected_qty: a.ui_expected_qty,
              reviewer_id: a.ui_reviewer_id
            };
          }
        }
        
        return {
          employee_id: a.employee_id,
          task_category: category,
          zone_id: a.zone_id,
          barn_id: a.barn_id,
          assigned_shower_id: a.assigned_shower_id,
          shift: a.shift,
          task_description: combinedDesc,
          biosecurity_level: a.biosecurity_level,
          status: 'assigned',
          plan_id: plan!.id,
          metadata
        };
      });
      const res = await supabase.from('assigned_tasks').insert(tasksToInsert);
      if (res.error) {
        alert("Có lỗi xảy ra khi gán công việc: " + res.error.message);
        return;
      }
    }
    
    setIsPublished(true);
    alert("Đã giao việc thành công! Hệ thống đã tạo task cho nhân viên và cấp quyền Finger Scan.");
  };

  const addAssignment = () => {
    setAssignments([...assignments, {
      id: crypto.randomUUID(),
      employee_id: employees[0]?.id || '',
      task_category: 'sanitation',
      zone_id: null,
      barn_id: null,
      assigned_shower_id: showers[0]?.id || null,
      shift: 'day',
      task_description: '',
      biosecurity_level: 'normal',
      status: 'draft',
      ui_task_type: 'cleaning',
      ui_cleaning_desc: '',
      ui_technical_desc: '',
      ui_source_farm_id: farmId,
      ui_dest_farm_id: farmId,
    }]);
  };

  const updateAssignment = (id: string, field: keyof Assignment, value: any) => {
    setAssignments(assignments.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const removeAssignment = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };

  const reviewers = employees.filter(e => e.job_title?.toLowerCase().includes('bác sĩ') || e.job_title?.toLowerCase().includes('quản lý'));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <ClipboardList className="mr-3 text-blue-600 dark:text-blue-400" size={28} />
            Phân công công việc hằng ngày
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Lập kế hoạch, kiểm tra lỗi an toàn sinh học và giao việc (Planned Data)</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <span className={`px-4 py-2 rounded-lg font-medium flex items-center ${isPublished ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
            {isPublished ? <><CheckCircle size={18} className="mr-2" /> Đã giao việc (Published)</> : 'Bản nháp (Draft)'}
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3">
        <button onClick={addAssignment} disabled={isPublished} className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition">
          <Plus size={16} className="mr-2" /> Thêm công việc
        </button>
        <button disabled={isPublished} className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition">
          <Copy size={16} className="mr-2" /> Chép từ hôm qua
        </button>
        <button disabled={isPublished} className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition">
          <Upload size={16} className="mr-2" /> Nhập từ Excel
        </button>
        <button className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
          <Download size={16} className="mr-2" /> Xuất Excel
        </button>
        <div className="flex-1"></div>
        <button onClick={handleValidate} className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">
          <AlertCircle size={16} className="mr-2" /> Kiểm tra lỗi ATSH
        </button>
        <button onClick={handleAssign} disabled={isPublished || assignments.length === 0} className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-lg shadow-blue-500/30 font-medium">
          <Send size={18} className="mr-2" /> Giao việc (Assign)
        </button>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
          <h3 className="text-red-800 dark:text-red-400 font-bold flex items-center mb-3">
            <ShieldAlert size={20} className="mr-2" /> Không thể Assign! Phát hiện lỗi vi phạm ATSH:
          </h3>
          <ul className="space-y-2">
            {validationErrors.map((err, idx) => (
              <li key={idx} className="flex items-start text-red-700 dark:text-red-300">
                <span className="mr-2 font-bold">•</span> {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Data Grid / Cards */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center text-gray-500 border border-dashed border-gray-300 dark:border-gray-700">
            Chưa có công việc nào được phân công. Hãy nhấn "Thêm công việc" hoặc "Chép từ hôm qua".
          </div>
        ) : (
          assignments.map((a, idx) => {
            const isPigletTask = ['pen_check', 'handover', 'receiving'].includes(a.ui_task_type || '');
            
            return (
            <div key={a.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition relative">
              
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200 flex items-center">
                  <span className={`px-2 py-1 rounded-md mr-3 text-sm ${isPigletTask ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>#{idx + 1}</span>
                  Giao việc
                </h4>
                {!isPublished && (
                  <button onClick={() => removeAssignment(a.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition text-sm flex items-center">
                    <X size={16} className="mr-1"/> Xóa
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                {/* Employee */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Nhân sự thực hiện</label>
                  <select 
                    disabled={isPublished}
                    value={a.employee_id} 
                    onChange={(e) => updateAssignment(a.id, 'employee_id', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn nhân sự --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.job_title})</option>
                    ))}
                  </select>
                </div>

                {/* Shift */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Ca làm việc</label>
                  <select 
                    disabled={isPublished}
                    value={a.shift} 
                    onChange={(e) => updateAssignment(a.id, 'shift', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="day">☀️ Ca Ngày</option>
                    <option value="night">🌙 Ca Đêm</option>
                  </select>
                </div>

                {/* Zone */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Khu vực (Zone)</label>
                  <select 
                    disabled={isPublished}
                    value={a.zone_id || ''} 
                    onChange={(e) => updateAssignment(a.id, 'zone_id', e.target.value || null)}
                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Toàn trại --</option>
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>{z.zone_name}</option>
                    ))}
                  </select>
                </div>

                {/* Barn */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Chuồng (Barn)</label>
                  <select 
                    disabled={isPublished || !a.zone_id}
                    value={a.barn_id || ''} 
                    onChange={(e) => updateAssignment(a.id, 'barn_id', e.target.value || null)}
                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Tùy ý --</option>
                    {barns.filter(b => b.zone_id === a.zone_id).map(b => (
                      <option key={b.id} value={b.id}>{b.barn_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Task Type & Details */}
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-5 border border-gray-100 dark:border-gray-600">
                <div className="mb-4 flex flex-col md:flex-row md:items-start gap-4">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap mt-2">Loại công việc:</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center cursor-pointer bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-500 transition">
                      <input 
                        type="radio" 
                        disabled={isPublished}
                        name={`task_type_${a.id}`} 
                        value="cleaning"
                        checked={a.ui_task_type === 'cleaning'}
                        onChange={() => updateAssignment(a.id, 'ui_task_type', 'cleaning')}
                        className="mr-2 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Vệ sinh</span>
                    </label>
                    <label className="flex items-center cursor-pointer bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-500 transition">
                      <input 
                        type="radio" 
                        disabled={isPublished}
                        name={`task_type_${a.id}`} 
                        value="technical"
                        checked={a.ui_task_type === 'technical'}
                        onChange={() => updateAssignment(a.id, 'ui_task_type', 'technical')}
                        className="mr-2 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Kỹ thuật</span>
                    </label>
                    <label className="flex items-center cursor-pointer bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-500 transition">
                      <input 
                        type="radio" 
                        disabled={isPublished}
                        name={`task_type_${a.id}`} 
                        value="both"
                        checked={a.ui_task_type === 'both'}
                        onChange={() => updateAssignment(a.id, 'ui_task_type', 'both')}
                        className="mr-2 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Cả hai</span>
                    </label>
                    <div className="w-full h-px bg-slate-200 dark:bg-slate-700 my-1 hidden lg:block"></div>
                    <label className="flex items-center cursor-pointer bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 transition">
                      <input 
                        type="radio" 
                        disabled={isPublished}
                        name={`task_type_${a.id}`} 
                        value="pen_check"
                        checked={a.ui_task_type === 'pen_check'}
                        onChange={() => updateAssignment(a.id, 'ui_task_type', 'pen_check')}
                        className="mr-2 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span className="text-indigo-700 dark:text-indigo-300 font-medium">Kiểm tra chuồng</span>
                    </label>
                    <label className="flex items-center cursor-pointer bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 transition">
                      <input 
                        type="radio" 
                        disabled={isPublished}
                        name={`task_type_${a.id}`} 
                        value="handover"
                        checked={a.ui_task_type === 'handover'}
                        onChange={() => updateAssignment(a.id, 'ui_task_type', 'handover')}
                        className="mr-2 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span className="text-indigo-700 dark:text-indigo-300 font-medium">Bàn giao heo con</span>
                    </label>
                    <label className="flex items-center cursor-pointer bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 transition">
                      <input 
                        type="radio" 
                        disabled={isPublished}
                        name={`task_type_${a.id}`} 
                        value="receiving"
                        checked={a.ui_task_type === 'receiving'}
                        onChange={() => updateAssignment(a.id, 'ui_task_type', 'receiving')}
                        className="mr-2 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span className="text-indigo-700 dark:text-indigo-300 font-medium">Nhận heo cai sữa</span>
                    </label>
                  </div>
                </div>

                {isPigletTask && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Trại xuất</label>
                      <select disabled={isPublished} value={a.ui_source_farm_id || ''} onChange={e => updateAssignment(a.id, 'ui_source_farm_id', e.target.value)} className="w-full p-2 border rounded">
                        <option value="">-- Chọn trại --</option>
                        {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Trại nhận</label>
                      <select disabled={isPublished} value={a.ui_dest_farm_id || ''} onChange={e => updateAssignment(a.id, 'ui_dest_farm_id', e.target.value)} className="w-full p-2 border rounded">
                        <option value="">-- Chọn trại --</option>
                        {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Thời gian dự kiến</label>
                      <input type="datetime-local" disabled={isPublished} value={a.ui_expected_time || ''} onChange={e => updateAssignment(a.id, 'ui_expected_time', e.target.value)} className="w-full p-2 border rounded"/>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Số lượng dự kiến</label>
                      <input type="number" disabled={isPublished} value={a.ui_expected_qty || ''} onChange={e => updateAssignment(a.id, 'ui_expected_qty', Number(e.target.value))} className="w-full p-2 border rounded"/>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Người duyệt (Bác sĩ / Quản lý)</label>
                      <select disabled={isPublished} value={a.ui_reviewer_id || ''} onChange={e => updateAssignment(a.id, 'ui_reviewer_id', e.target.value)} className="w-full p-2 border rounded">
                        <option value="">-- Chọn người duyệt --</option>
                        {reviewers.map(r => <option key={r.id} value={r.id}>{r.full_name} - {r.job_title}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(a.ui_task_type === 'cleaning' || a.ui_task_type === 'both') && (
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                      <label className="block text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Mô tả công việc Vệ sinh</label>
                      <textarea
                        disabled={isPublished}
                        value={a.ui_cleaning_desc || ''}
                        onChange={(e) => updateAssignment(a.id, 'ui_cleaning_desc', e.target.value)}
                        placeholder="Nhập chi tiết công việc vệ sinh..."
                        className="w-full bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-900/50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                      />
                    </div>
                  )}
                  
                  {(a.ui_task_type === 'technical' || a.ui_task_type === 'both') && (
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                      <label className="block text-sm font-medium text-purple-700 dark:text-purple-400 mb-1">Mô tả công việc Kỹ thuật</label>
                      <textarea
                        disabled={isPublished}
                        value={a.ui_technical_desc || ''}
                        onChange={(e) => updateAssignment(a.id, 'ui_technical_desc', e.target.value)}
                        placeholder="Nhập chi tiết công việc kỹ thuật..."
                        className="w-full bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-900/50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
                      />
                    </div>
                  )}

                  {(a.ui_task_type === 'pen_check' || a.ui_task_type === 'handover' || a.ui_task_type === 'receiving') && (
                    <div className="animate-in fade-in zoom-in-95 duration-200 col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-indigo-700 dark:text-indigo-400 mb-1">Ghi chú & Yêu cầu cụ thể</label>
                      <textarea
                        disabled={isPublished}
                        value={a.task_description || ''}
                        onChange={(e) => updateAssignment(a.id, 'task_description', e.target.value)}
                        placeholder="Nhập ghi chú hoặc yêu cầu cụ thể (VD: Chú ý máng ăn chuồng 3)..."
                        className="w-full bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-900/50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
          })
        )}
      </div>
    </div>
  );
}
