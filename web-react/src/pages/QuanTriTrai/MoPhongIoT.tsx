import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useOutletContext } from 'react-router-dom';
import { Cpu, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function MoPhongIoT() {
  const { farmId } = useOutletContext<{ farmId: string }>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const [employees, setEmployees] = useState<any[]>([]);
  const [checkpoints, setCheckpoints] = useState<any[]>([]);

  useEffect(() => {
    if (farmId) {
      fetchData();
    }
  }, [farmId]);

  const fetchData = async () => {
    const { data: emps } = await supabase.from('employees').select('*').eq('farm_id', farmId);
    const { data: chks } = await supabase.from('checkpoints').select('*').eq('farm_id', farmId);
    if (emps) setEmployees(emps);
    if (chks) setCheckpoints(chks);
  };

  const showMsg = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const simulateScan = async (scenario: 'valid' | 'warning' | 'critical') => {
    setLoading(true);
    try {
      const emp = employees[Math.floor(Math.random() * employees.length)];
      
      let checkpoint = null;
      let decision = 'allow';
      let reason = 'Hợp lệ';
      let risk_level = 'low';

      if (scenario === 'valid') {
        checkpoint = checkpoints.find(c => c.checkpoint_type === 'gate');
      } else if (scenario === 'warning') {
        checkpoint = checkpoints.find(c => c.checkpoint_type === 'shower');
        decision = 'warning';
        reason = 'Đi sai phòng tắm quy định';
        risk_level = 'medium';
      } else {
        checkpoint = checkpoints.find(c => c.checkpoint_type === 'barn_door');
        decision = 'deny';
        reason = 'Cố gắng vào khu vực không được cấp quyền';
        risk_level = 'critical';
      }

      if (!emp || !checkpoint) throw new Error("Chưa có data mẫu.");

      // Insert log
      const { data: logRes } = await supabase.from('finger_scan_logs').insert({
        farm_id: farmId,
        checkpoint_id: checkpoint.id,
        employee_id: emp.id,
        decision,
        reason,
        risk_level
      }).select().single();

      // If warning or critical, generate alert
      if (decision !== 'allow' && logRes) {
        await supabase.from('biosecurity_alerts').insert({
          farm_id: farmId,
          alert_type: scenario === 'warning' ? 'wrong_shower' : 'unauthorized_access',
          severity: scenario === 'warning' ? 'medium' : 'critical',
          employee_id: emp.id,
          checkpoint_id: checkpoint.id,
          scan_log_id: logRes.id,
          description: `Phát hiện: ${emp.full_name} - ${reason} tại ${checkpoint.checkpoint_name}`
        });
      }

      showMsg(`Đã tạo sự kiện Finger Scan: ${decision.toUpperCase()}!`, 'success');
    } catch (err: any) {
      showMsg('Lỗi: ' + err.message, 'error');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center mb-2">
          <Cpu className="mr-3 text-blue-600 dark:text-blue-400" size={28} />
          Mô phỏng IoT (Finger Scan Simulator)
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Bảng điều khiển này gửi các bản tin giả lập về server, đóng vai trò như các thiết bị vân tay thực tế gửi sự kiện.
        </p>

        {message && (
          <div className={`p-4 rounded-xl mb-6 font-medium flex items-center ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle className="mr-2" /> : <AlertTriangle className="mr-2" />}
            {message.text}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <div className="border dark:border-gray-700 p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2 text-green-700 dark:text-green-400 flex items-center">
                <CheckCircle size={20} className="mr-2" /> Hợp lệ (Allow)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Mô phỏng nhân sự quét vân tay hợp lệ tại cổng.
              </p>
            </div>
            <button 
              onClick={() => simulateScan('valid')}
              disabled={loading}
              className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition"
            >
              Gửi dữ liệu Hợp lệ
            </button>
          </div>

          <div className="border dark:border-gray-700 p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2 text-orange-600 flex items-center">
                <AlertTriangle size={20} className="mr-2" /> Cảnh báo (Warning)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Mô phỏng nhân sự đi sai phòng tắm. Tạo cảnh báo Medium.
              </p>
            </div>
            <button 
              onClick={() => simulateScan('warning')}
              disabled={loading}
              className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition"
            >
              Gửi dữ liệu Cảnh báo
            </button>
          </div>

          <div className="border dark:border-gray-700 p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2 text-red-600 flex items-center">
                <XCircle size={20} className="mr-2" /> Từ chối (Deny)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Mô phỏng nhân sự cố mở cửa khu vực không được phân công.
              </p>
            </div>
            <button 
              onClick={() => simulateScan('critical')}
              disabled={loading}
              className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition shadow-lg shadow-red-500/30"
            >
              Gửi dữ liệu Từ chối
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
