import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import { 
  ClipboardList, Plus, Copy, Upload, Download, 
  CheckCircle, AlertCircle, Send, Calendar, ShieldAlert
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
}

export default function PhanCongCongViec() {
  const { farmId } = useOutletContext<{ farmId: string }>();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [barns, setBarns] = useState<Barn[]>([]);
  const [showers, setShowers] = useState<Shower[]>([]);
  
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
        { id: 'mock-3', full_name: 'Lê Văn C', job_title: 'Bảo vệ', employee_code: 'EMP-003', department: 'An ninh' }
      ]);
    }
  };

  const fetchMasterData = async () => {
    await fetchEmployees();
    const [zoneRes, barnRes, showerRes] = await Promise.all([
      supabase.from('farm_zones').select('*').eq('farm_id', farmId),
      supabase.from('barns').select('*, farm_zones!inner(farm_id)').eq('farm_zones.farm_id', farmId),
      supabase.from('shower_rooms').select('*, checkpoints!inner(farm_id)').eq('checkpoints.farm_id', farmId)
    ]);
    
    if (zoneRes.data && zoneRes.data.length > 0) {
      setZones(zoneRes.data);
    } else {
      setZones([
        { id: 'zone-1', zone_name: 'Khu chuồng đẻ', zone_type: 'farrowing', risk_level: 'high' } as Zone,
        { id: 'zone-2', zone_name: 'Khu chuồng bầu', zone_type: 'gestation', risk_level: 'medium' } as Zone,
        { id: 'zone-3', zone_name: 'Khu cách ly', zone_type: 'isolation', risk_level: 'isolation' } as Zone,
        { id: 'zone-4', zone_name: 'Khu phụ trợ', zone_type: 'support', risk_level: 'low' } as Zone
      ]);
    }

    if (barnRes.data && barnRes.data.length > 0) {
      setBarns(barnRes.data);
    } else {
      setBarns([
        { id: 'de1', zone_id: 'zone-1', barn_name: 'Chuồng Đẻ 1', barn_type: 'farrowing' } as Barn,
        { id: 'de2', zone_id: 'zone-1', barn_name: 'Chuồng Đẻ 2', barn_type: 'farrowing' } as Barn,
        { id: 'de3', zone_id: 'zone-1', barn_name: 'Chuồng Đẻ 3', barn_type: 'farrowing' } as Barn,
        { id: 'bau1', zone_id: 'zone-2', barn_name: 'Chuồng Bầu 1', barn_type: 'gestation' } as Barn,
        { id: 'bau2', zone_id: 'zone-2', barn_name: 'Chuồng Bầu 2', barn_type: 'gestation' } as Barn,
        { id: 'cach_ly1', zone_id: 'zone-3', barn_name: 'Cách Ly 1', barn_type: 'isolation' } as Barn,
        { id: 'cach_ly2', zone_id: 'zone-3', barn_name: 'Cách Ly 2', barn_type: 'isolation' } as Barn,
        { id: 'hau_bi_cl', zone_id: 'zone-3', barn_name: 'Hậu Bị Cách Ly', barn_type: 'isolation' } as Barn,
        { id: 'kho_thuoc', zone_id: 'zone-4', barn_name: 'Kho Thuốc', barn_type: 'support' } as Barn,
        { id: 'kho_cam', zone_id: 'zone-4', barn_name: 'Kho Cám', barn_type: 'support' } as Barn,
        { id: 'sinh_hoat', zone_id: 'zone-4', barn_name: 'Khu Sinh Hoạt', barn_type: 'support' } as Barn,
        { id: 'cong', zone_id: 'zone-4', barn_name: 'Cổng Trại', barn_type: 'support' } as Barn
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
        setAssignments(tasks);
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
      const tasksToInsert = assignments.map(a => ({
        ...a,
        id: undefined, // let db generate
        plan_id: plan.id,
        status: 'assigned'
      }));
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
      task_category: 'general',
      zone_id: null,
      barn_id: null,
      assigned_shower_id: showers[0]?.id || null,
      shift: 'day',
      task_description: 'Công việc mới',
      biosecurity_level: 'normal',
      status: 'draft'
    }]);
  };

  const updateAssignment = (id: string, field: keyof Assignment, value: any) => {
    setAssignments(assignments.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const removeAssignment = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };

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

      {/* Data Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Nhân sự</th>
                <th className="px-4 py-3">Ca làm</th>
                <th className="px-4 py-3">Nhóm / Vai trò</th>
                <th className="px-4 py-3">Khu vực (Zone)</th>
                <th className="px-4 py-3">Chuồng (Barn)</th>
                <th className="px-4 py-3">Phòng tắm bắt buộc</th>
                <th className="px-4 py-3">Mô tả chi tiết</th>
                {!isPublished && <th className="px-4 py-3 text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                    Chưa có công việc nào được phân công. Hãy nhấn "Thêm công việc" hoặc "Chép từ hôm qua".
                  </td>
                </tr>
              ) : (
                assignments.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <select 
                        disabled={isPublished}
                        value={a.employee_id} 
                        onChange={(e) => updateAssignment(a.id, 'employee_id', e.target.value)}
                        className="w-full bg-transparent border-gray-300 dark:border-gray-600 rounded p-1 outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">-- Chọn --</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.job_title})</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select 
                        disabled={isPublished}
                        value={a.shift} 
                        onChange={(e) => updateAssignment(a.id, 'shift', e.target.value)}
                        className="bg-transparent border-gray-300 dark:border-gray-600 rounded p-1"
                      >
                        <option value="day">Ngày</option>
                        <option value="night">Đêm</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select 
                        disabled={isPublished}
                        value={a.task_category} 
                        onChange={(e) => updateAssignment(a.id, 'task_category', e.target.value)}
                        className="bg-transparent border-gray-300 dark:border-gray-600 rounded p-1"
                      >
                        <option value="farrowing">Chuồng đẻ</option>
                        <option value="gestation">Chuồng bầu</option>
                        <option value="vet">Kỹ thuật / Vet</option>
                        <option value="isolation">Cách ly</option>
                        <option value="sanitation">Phòng dịch / Vệ sinh</option>
                        <option value="general">Khác</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select 
                        disabled={isPublished}
                        value={a.zone_id || ''} 
                        onChange={(e) => updateAssignment(a.id, 'zone_id', e.target.value || null)}
                        className="bg-transparent border-gray-300 dark:border-gray-600 rounded p-1"
                      >
                        <option value="">-- Tùy ý --</option>
                        {zones.map(z => (
                          <option key={z.id} value={z.id}>{z.zone_name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select 
                        disabled={isPublished || !a.zone_id}
                        value={a.barn_id || ''} 
                        onChange={(e) => updateAssignment(a.id, 'barn_id', e.target.value || null)}
                        className="bg-transparent border-gray-300 dark:border-gray-600 rounded p-1"
                      >
                        <option value="">-- Toàn khu --</option>
                        {barns.filter(b => b.zone_id === a.zone_id).map(b => (
                          <option key={b.id} value={b.id}>{b.barn_name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select 
                        disabled={isPublished}
                        value={a.assigned_shower_id || ''} 
                        onChange={(e) => updateAssignment(a.id, 'assigned_shower_id', e.target.value || null)}
                        className="bg-transparent border-gray-300 dark:border-gray-600 rounded p-1"
                      >
                        <option value="">-- Bỏ qua --</option>
                        {showers.map(s => (
                          <option key={s.id} value={s.id}>{s.room_name} (Max {s.max_capacity})</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        disabled={isPublished}
                        type="text" 
                        value={a.task_description} 
                        onChange={(e) => updateAssignment(a.id, 'task_description', e.target.value)}
                        placeholder="Nhiệm vụ..."
                        className="w-full bg-transparent border-gray-300 dark:border-gray-600 border rounded p-1 px-2 focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    {!isPublished && (
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => removeAssignment(a.id)} className="text-red-500 hover:text-red-700 font-medium">Xóa</button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
