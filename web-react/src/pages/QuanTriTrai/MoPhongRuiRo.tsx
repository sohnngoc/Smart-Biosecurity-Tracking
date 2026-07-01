import { useState } from 'react';
import { useOutletContext} from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { ShieldAlert, Play, RotateCcw, AlertTriangle, UserX, CheckCircle, Search, MapPin } from 'lucide-react';
import TraceEmployeeDashboard from './components/TraceEmployeeDashboard';
import TraceBarnDashboard from './components/TraceBarnDashboard';

const SCENARIOS = [
  {
    id: 'S1',
    code: 'WRONG_ZONE_LIVING_AREA',
    title: 'S1: Vào khu sinh hoạt sai quy trình',
    desc: 'Nhân viên A sau khi bấm vân tay ở cổng, thay vì đi vào khu tắm sát trùng lại tiếp tục bấm vân tay đi thẳng vào khu sinh hoạt.',
    riskLevel: 'Critical',
    riskPoints: 30,
    icon: <UserX className="text-red-500" size={24} />,
    color: 'border-red-500'
  },
  {
    id: 'S2',
    code: 'WRONG_BARN_ENTRY',
    title: 'S2: Đi sai chuồng làm việc (Cross-contamination)',
    desc: 'Nhân viên được phân công làm việc ở chuồng đẻ 1 nhưng thực tế lại sang chuồng bầu bấm vân tay, gây nguy cơ lây nhiễm chéo.',
    riskLevel: 'Critical',
    riskPoints: 40,
    icon: <AlertTriangle className="text-red-500" size={24} />,
    color: 'border-red-500'
  },
  {
    id: 'S3',
    code: 'TRACE_EMPLOYEE',
    title: 'S3: Truy vết lịch sử di chuyển công nhân',
    desc: 'Khi phát hiện một công nhân có nguy cơ dịch tễ (Đinh Văn Nam), truy vết lại toàn bộ lịch sử ra/vào các chuồng trong vòng 30 ngày.',
    riskLevel: 'Warning',
    riskPoints: 0,
    icon: <Search className="text-indigo-500" size={24} />,
    color: 'border-indigo-500'
  },
  {
    id: 'S4',
    code: 'TRACE_BARN',
    title: 'S4: Truy vết lịch sử ra/vào Chuồng đẻ 1',
    desc: 'Khi phát hiện rủi ro dịch bệnh tại Chuồng đẻ 1, truy vết lại toàn bộ những người đã từng vào chuồng này trong vòng 30 ngày.',
    riskLevel: 'Critical',
    riskPoints: 0,
    icon: <MapPin className="text-red-500" size={24} />,
    color: 'border-red-500'
  }
];

export default function MoPhongRuiRo() {
  const { farmId } = useOutletContext<{ farmId: string }>();
  const [running, setRunning] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);
  
  const [activeDrawer, setActiveDrawer] = useState<'S3' | 'S4' | null>(null);

  const showToast = (msg: string, type: 'success'|'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRunSimulation = async (scenario: typeof SCENARIOS[0]) => {
    if (!farmId) return;
    
    if (scenario.id === 'S3' || scenario.id === 'S4') {
      setActiveDrawer(scenario.id);
      return;
    }

    setRunning(scenario.id);

    try {
      // 1. Tăng điểm Risk Score của Farm (nếu DB hỗ trợ, nếu lỗi thì bỏ qua)
      let newScore = 0;
      try {
        const { data: farm } = await supabase.from('farms').select('risk_score').eq('id', farmId).single();
        const currentScore = farm?.risk_score || 0;
        newScore = currentScore + scenario.riskPoints;
        if (newScore > 100) newScore = 100;
        await supabase.from('farms').update({ risk_score: newScore }).eq('id', farmId);
      } catch (e) {
        console.warn('Không thể cập nhật risk_score trên DB, có thể do thiếu cột.', e);
      }

      // 2. Tạo Alert
      let recommendedAction = '';
      if (scenario.id === 'S1') recommendedAction = 'Chặn cửa khu sinh hoạt — Yêu cầu nhân viên A quay lại thực hiện quy trình tắm sát trùng — Ghi log vi phạm';
      else if (scenario.id === 'S2') recommendedAction = 'Phát cảnh báo loa tại chuồng bầu — Yêu cầu nhân viên B rời khỏi khu vực lập tức — Phun sát trùng khẩn cấp lối đi';

      const alertMsg = scenario.id === 'S1' 
        ? 'Nhân viên A bỏ qua bước tắm sát trùng và cố gắng xâm nhập vào khu sinh hoạt!'
        : 'Nhân viên B (Chuồng đẻ 1) đi sai tuyến đường và cố gắng mở cửa Chuồng Bầu!';

      // Get an employee and checkpoint for mock logs
      const { data: employees } = await supabase.from('employees').select('id').limit(2);
      const empId = scenario.id === 'S1' ? employees?.[0]?.id : employees?.[1]?.id;
      
      const chkKeyword = scenario.id === 'S1' ? 'Tắm' : 'Bầu'; // Since we might not have a Sinh Hoat checkpoint, we use Tắm or Bầu to trigger alerts in map based on location, but the alert text says Sinh hoat. Wait, we can fetch any checkpoint to satisfy FK.
      const { data: checkpoints } = await supabase.from('checkpoints').select('id').ilike('checkpoint_name', `%${chkKeyword}%`).limit(1);
      const chkId = checkpoints?.[0]?.id;

      let logId = null;
      if (empId && chkId) {
        const { data: logData, error: logError } = await supabase.from('finger_scan_logs').insert({
          farm_id: farmId,
          checkpoint_id: chkId,
          employee_id: empId,
          decision: 'deny',
          reason: scenario.id === 'S1' ? 'Sai quy trình (Bỏ qua tắm)' : 'Sai khu vực làm việc (Chuồng Bầu)',
          risk_level: 'critical'
        }).select('id').single();
        if (!logError && logData) logId = logData.id;
      }

      const { error: alertError } = await supabase.from('biosecurity_alerts').insert({
        farm_id: farmId,
        alert_type: scenario.id === 'S1' ? 'unauthorized_access' : 'wrong_barn',
        severity: 'critical',
        description: alertMsg + `\n(Hành động: ${recommendedAction})`,
        status: 'open',
        employee_id: empId || null,
        checkpoint_id: chkId || null,
        scan_log_id: logId
      });

      if (alertError) {
        throw alertError;
      }

      showToast(`Chạy thành công: ${scenario.title}`, 'success');

    } catch (error: any) {
      console.error('Simulation error:', error);
      showToast('Có lỗi xảy ra: ' + (error?.message || 'Không xác định'), 'error');
    } finally {
      setRunning(null);
    }
  };

  const handleReset = async () => {
    if (!farmId) return;
    setResetting(true);
    try {
      // Xoá alerts tạo ra từ mô phỏng
      await supabase.from('alerts').delete().eq('farm_id', farmId).eq('alert_type', 'Mô phỏng rủi ro ATSH');
      
      // Xoá các data báo cáo giả lập
      await supabase.from('cleaning_tasks').delete().eq('farm_id', farmId).like('task_name', '%Auto-generated%');
      
      try {
        // Reset điểm (nếu DB hỗ trợ)
        await supabase.from('farms').update({ risk_score: 0 }).eq('id', farmId);
      } catch (e) {
        console.warn('Không thể reset risk_score trên DB.', e);
      }
      
      // Clear IoT test zone
      localStorage.removeItem('iot_selected_zone');
      window.dispatchEvent(new Event('iot_zone_changed'));
      
      showToast('Đã Reset dữ liệu mô phỏng thành công!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Lỗi khi reset dữ liệu!', 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center text-gray-700">
          <ShieldAlert className="mr-2 text-blue-600" />
          <h2 className="text-lg font-bold">Biosecurity Risk Simulation Scenarios</h2>
        </div>
        <button 
          onClick={handleReset}
          disabled={resetting}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center transition-colors"
        >
          <RotateCcw size={16} className={`mr-2 ${resetting ? 'animate-spin' : ''}`} />
          Reset Simulation Data
        </button>
      </div>

      {toast && (
        <div className={`p-4 rounded-lg shadow-md flex items-center text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          <CheckCircle className="mr-2" size={20} />
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SCENARIOS.map((sc) => (
          <div key={sc.id} className={`bg-white rounded-xl shadow-sm border-t-4 ${sc.color} p-5 flex flex-col justify-between hover:shadow-md transition-shadow`}>
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  {sc.icon}
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${sc.riskLevel === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    {sc.riskLevel}
                  </span>
                  <span className="text-xs text-gray-500 font-medium mt-1">+{sc.riskPoints} Risk Score</span>
                </div>
              </div>
              <h3 className="font-bold text-gray-800 text-base mb-2">{sc.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {sc.desc}
              </p>
            </div>
            
            <button 
              onClick={() => handleRunSimulation(sc)}
              disabled={running === sc.id}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center font-medium text-sm transition-colors ${
                running === sc.id 
                  ? 'bg-blue-100 text-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
              }`}
            >
              <Play size={16} className="mr-2 fill-current" />
              {running === sc.id ? 'Running...' : 'Run Scenario'}
            </button>
          </div>
        ))}
      </div>

      {activeDrawer === 'S3' && <TraceEmployeeDashboard onClose={() => setActiveDrawer(null)} />}
      {activeDrawer === 'S4' && <TraceBarnDashboard onClose={() => setActiveDrawer(null)} />}
    </div>
  );
}
