import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Fingerprint, Search, Filter, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export const generateMockPersons = () => []; // Temporary stub to prevent TongQuanTrai crash

interface ScanLog {
  id: string;
  scan_time: string;
  decision: string;
  reason: string;
  risk_level: string;
  employees: { full_name: string; employee_code: string; job_title: string };
  checkpoints: { checkpoint_name: string; checkpoint_type: string };
  finger_scan_devices: { device_name: string };
}

export default function NguoiRaVao() {
  const { farmId } = useOutletContext<{ farmId: string }>();
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (farmId) fetchLogs();
  }, [farmId, filter]);

  const fetchLogs = async () => {
    let query = supabase
      .from('finger_scan_logs')
      .select(`
        id, scan_time, decision, reason, risk_level,
        employees (full_name, employee_code, job_title),
        checkpoints (checkpoint_name, checkpoint_type),
        finger_scan_devices (device_name)
      `)
      .eq('farm_id', farmId)
      .order('scan_time', { ascending: false });

    if (filter !== 'all') {
      if (filter === 'violations') {
        query = query.in('decision', ['deny', 'warning']);
      } else {
        query = query.eq('checkpoints.checkpoint_type', filter);
      }
    }

    const { data } = await query;
    // Post-filter if using foreign table filter fallback
    let finalData = data as any;
    if (filter !== 'all' && filter !== 'violations') {
      finalData = finalData?.filter((d: any) => d.checkpoints?.checkpoint_type === filter);
    }
    setLogs(finalData || []);
  };

  const getDecisionBadge = (decision: string) => {
    switch(decision) {
      case 'allow': return <span className="flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold"><CheckCircle size={12} className="mr-1"/> Hợp lệ</span>;
      case 'warning': return <span className="flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold"><AlertTriangle size={12} className="mr-1"/> Cảnh báo</span>;
      case 'deny': return <span className="flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold"><XCircle size={12} className="mr-1"/> Từ chối</span>;
      default: return <span>{decision}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <Fingerprint className="mr-3 text-blue-600 dark:text-blue-400" size={28} />
            Lịch sử Finger Scan (Vào/Ra)
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Dữ liệu quét vân tay thực tế tại các trạm kiểm soát (Actual Data)</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'gate', 'shower', 'barn_door', 'warehouse', 'isolation', 'violations'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {f === 'all' && 'Tất cả'}
            {f === 'gate' && 'Cổng chính'}
            {f === 'shower' && 'Phòng tắm'}
            {f === 'barn_door' && 'Cửa chuồng'}
            {f === 'warehouse' && 'Kho'}
            {f === 'isolation' && 'Khu cách ly'}
            {f === 'violations' && 'Lỗi / Cảnh báo'}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 uppercase font-semibold">
              <tr>
                <th className="px-4 py-4">Thời gian</th>
                <th className="px-4 py-4">Nhân sự</th>
                <th className="px-4 py-4">Vị trí (Checkpoint)</th>
                <th className="px-4 py-4">Thiết bị</th>
                <th className="px-4 py-4">Kết quả</th>
                <th className="px-4 py-4">Lý do & Mức độ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {logs.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Không có dữ liệu.</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{new Date(log.scan_time).toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-800 dark:text-gray-200">{log.employees?.full_name}</div>
                      <div className="text-xs text-gray-500">{log.employees?.job_title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold">{log.checkpoints?.checkpoint_name}</div>
                      <div className="text-xs uppercase text-gray-500">{log.checkpoints?.checkpoint_type}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">{log.finger_scan_devices?.device_name}</td>
                    <td className="px-4 py-3">{getDecisionBadge(log.decision)}</td>
                    <td className="px-4 py-3">
                      <div>{log.reason}</div>
                      {log.risk_level && log.risk_level !== 'low' && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-xs">
                          Risk: {log.risk_level.toUpperCase()}
                        </span>
                      )}
                    </td>
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
