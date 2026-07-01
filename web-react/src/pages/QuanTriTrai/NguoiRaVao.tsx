import { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Fingerprint, AlertTriangle, CheckCircle, XCircle, Search, Calendar, MapPin, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { globalMockLogs } from '../../data/mockAccessLogs';

export const generateMockPersons = () => []; // Temporary stub to prevent TongQuanTrai crash

export default function NguoiRaVao() {
  const { farmId } = useOutletContext<{ farmId: string }>();
  const [dbLogs, setDbLogs] = useState<any[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('30');
  const [locationFilter, setLocationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (farmId) fetchDbLogs();
  }, [farmId]);

  const fetchDbLogs = async () => {
    const { data } = await supabase
      .from('finger_scan_logs')
      .select(`
        id, scan_time, decision, reason, risk_level,
        employees (full_name, employee_code, job_title),
        checkpoints (checkpoint_name, checkpoint_type),
        finger_scan_devices (device_name)
      `)
      .eq('farm_id', farmId)
      .order('scan_time', { ascending: false });
    
    setDbLogs(data || []);
  };

  const allLogs = useMemo(() => {
    // Combine DB logs with mock logs for demo
    // Prevent duplicates by checking ID (though mock IDs are 'mock-log-X')
    const combined = [...globalMockLogs, ...dbLogs];
    // Sort descending
    return combined.sort((a, b) => new Date(b.scan_time).getTime() - new Date(a.scan_time).getTime());
  }, [dbLogs]);

  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      // 1. Search term (Name or Code)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const empName = log.employees?.full_name?.toLowerCase() || '';
        const empCode = log.employees?.employee_code?.toLowerCase() || '';
        if (!empName.includes(term) && !empCode.includes(term)) return false;
      }
      
      // 2. Date Filter
      if (dateFilter !== 'all') {
        const days = parseInt(dateFilter);
        const logDate = new Date(log.scan_time);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        if (logDate < cutoff) return false;
      }

      // 3. Location Filter
      if (locationFilter !== 'all') {
        if (locationFilter === 'chuongde1') {
          if (log.checkpoints?.checkpoint_name !== 'Chuồng đẻ 1') return false;
        } else {
          if (log.checkpoints?.checkpoint_type !== locationFilter) return false;
        }
      }

      // 4. Status Filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'violations') {
          if (log.decision === 'allow') return false;
        } else if (log.decision !== statusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [allLogs, searchTerm, dateFilter, locationFilter, statusFilter]);

  const getDecisionBadge = (decision: string) => {
    switch(decision) {
      case 'allow': return <span className="flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold"><CheckCircle size={12} className="mr-1"/> Hợp lệ</span>;
      case 'warning': return <span className="flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold"><AlertTriangle size={12} className="mr-1"/> Cảnh báo</span>;
      case 'deny': return <span className="flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold"><XCircle size={12} className="mr-1"/> Vi phạm</span>;
      default: return <span>{decision}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <Fingerprint className="mr-3 text-blue-600 dark:text-blue-400" size={28} />
            Giám sát Ra/Vào
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Truy vết lịch sử di chuyển và kiểm soát ATSH (Finger Scan / Camera AI)</p>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2 text-slate-700 font-bold">
          <Filter size={18} className="text-indigo-500" /> Bộ lọc truy vết
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tên hoặc mã NV (VD: Đinh Văn Nam, NV-034)" 
              className="pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Date */}
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              className="pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full appearance-none"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="1">Hôm nay</option>
              <option value="7">7 ngày gần nhất</option>
              <option value="30">30 ngày gần nhất</option>
              <option value="all">Tất cả thời gian</option>
            </select>
          </div>

          {/* Location */}
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              className="pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full appearance-none"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="all">Tất cả khu vực</option>
              <option value="chuongde1" className="font-bold text-indigo-700">📌 Chuồng đẻ 1</option>
              <option value="gate">Cổng chính</option>
              <option value="shower">Khu sát trùng</option>
              <option value="isolation">Khu cách ly</option>
              <option value="barn_door">Cửa chuồng</option>
              <option value="warehouse">Kho thuốc/cám</option>
            </select>
          </div>

          {/* Status */}
          <div className="relative">
            <AlertTriangle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              className="pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="allow">Hợp lệ</option>
              <option value="warning">Cảnh báo</option>
              <option value="deny">Vi phạm (Từ chối)</option>
              <option value="violations">Tất cả Cảnh báo & Vi phạm</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setLocationFilter('chuongde1'); setStatusFilter('all'); setSearchTerm(''); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${locationFilter === 'chuongde1' ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'}`}>
          📌 Chuồng đẻ 1
        </button>
        <button onClick={() => { setStatusFilter('violations'); setLocationFilter('all'); setSearchTerm(''); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${statusFilter === 'violations' ? 'bg-red-600 text-white shadow-md' : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'}`}>
          ⚠️ Lỗi / Vi phạm
        </button>
        <button onClick={() => { setLocationFilter('all'); setStatusFilter('all'); setSearchTerm(''); setDateFilter('30'); }} className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-slate-200 hover:bg-slate-50 text-slate-600">
          Xoá bộ lọc
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-xs">
              <tr>
                <th className="px-4 py-4">Thời gian</th>
                <th className="px-4 py-4">Nhân sự</th>
                <th className="px-4 py-4">Vị trí (Khu vực)</th>
                <th className="px-4 py-4">Thiết bị</th>
                <th className="px-4 py-4">Trạng thái</th>
                <th className="px-4 py-4">Lý do & Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-500">Không tìm thấy dữ liệu phù hợp với bộ lọc.</td></tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className={`hover:bg-slate-50 transition-colors ${log.decision !== 'allow' ? 'bg-red-50/20' : ''}`}>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700">{new Date(log.scan_time).toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{log.employees?.full_name}</div>
                      <div className="text-xs text-slate-500">{log.employees?.employee_code} • {log.employees?.job_title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{log.checkpoints?.checkpoint_name}</div>
                      <div className="text-xs uppercase text-slate-400">{log.checkpoints?.checkpoint_type}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{log.finger_scan_devices?.device_name}</td>
                    <td className="px-4 py-3">{getDecisionBadge(log.decision)}</td>
                    <td className="px-4 py-3">
                      <div className="text-slate-600 font-medium">{log.reason}</div>
                      {log.risk_level && log.risk_level !== 'low' && (
                        <span className={`inline-block mt-1 px-2 py-0.5 border rounded text-xs font-bold ${log.risk_level === 'critical' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
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
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs font-medium text-slate-500 text-center">
          Hiển thị {filteredLogs.length} kết quả (Kết hợp {globalMockLogs.length} dữ liệu mô phỏng và {dbLogs.length} dữ liệu thực tế)
        </div>
      </div>
    </div>
  );
}
