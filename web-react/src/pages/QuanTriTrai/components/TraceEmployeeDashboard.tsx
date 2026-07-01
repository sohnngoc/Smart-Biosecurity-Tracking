import { X, Search, Map, ShieldAlert, CheckCircle, AlertTriangle, User, UserX, Clock, Calendar } from 'lucide-react';
import { globalMockLogs } from '../../../data/mockAccessLogs';
import { useState, useMemo } from 'react';

interface Props {
  onClose: () => void;
}

export default function TraceEmployeeDashboard({ onClose }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Lọc chỉ log của Đinh Văn Nam
  const employeeLogs = useMemo(() => {
    let logs = globalMockLogs.filter(l => l.employees.employee_code === 'NV-034');
    if (searchTerm) {
      logs = logs.filter(l => l.checkpoints.checkpoint_name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return logs;
  }, [searchTerm]);

  const totalLogs = employeeLogs.length;
  const uniqueBarns = new Set(employeeLogs.map(l => l.checkpoints.checkpoint_name)).size;
  const warnings = employeeLogs.filter(l => l.decision !== 'allow').length;
  const isHighRisk = warnings > 5;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-slate-50 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="bg-indigo-900 text-white p-6 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <UserX size={150} className="text-indigo-200" />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-indigo-800 text-indigo-100 rounded-full text-xs font-bold border border-indigo-700 uppercase tracking-wider">
                  Scenario 3
                </span>
                <span className="px-3 py-1 bg-red-500/20 text-red-200 rounded-full text-xs font-bold border border-red-500/50 flex items-center gap-1">
                  <ShieldAlert size={14} /> Truy vết khẩn cấp
                </span>
              </div>
              <h2 className="text-2xl font-black mb-1">Đinh Văn Nam</h2>
              <div className="flex gap-4 text-indigo-200 text-sm font-medium">
                <span>Mã NV: NV-034</span>
                <span>•</span>
                <span>Công nhân chuồng đẻ</span>
                <span>•</span>
                <span>Chăn nuôi</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-indigo-800 hover:bg-indigo-700 rounded-full transition-colors text-white">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <span className="text-slate-500 text-xs font-bold uppercase mb-1 flex items-center gap-1"><Clock size={14} /> Tổng lượt đi lại</span>
              <span className="text-2xl font-black text-slate-800">{totalLogs}</span>
              <span className="text-xs text-slate-400 mt-1">Trong 30 ngày qua</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <span className="text-slate-500 text-xs font-bold uppercase mb-1 flex items-center gap-1"><Map size={14} /> Số chuồng đã qua</span>
              <span className="text-2xl font-black text-indigo-600">{uniqueBarns}</span>
              <span className="text-xs text-slate-400 mt-1">Khu vực khác nhau</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <span className="text-slate-500 text-xs font-bold uppercase mb-1 flex items-center gap-1"><AlertTriangle size={14} /> Lượt cảnh báo</span>
              <span className="text-2xl font-black text-orange-500">{warnings}</span>
              <span className="text-xs text-slate-400 mt-1">Vi phạm quy trình</span>
            </div>
            <div className={`p-4 rounded-xl border flex flex-col justify-center items-center text-center ${isHighRisk ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
              <span className="text-xs font-bold uppercase mb-1">Mức độ rủi ro dịch tễ</span>
              <span className="text-2xl font-black uppercase">{isHighRisk ? 'Nguy Cơ Cao' : 'Kiểm Soát'}</span>
            </div>
          </div>

          {/* AI Warning */}
          {isHighRisk && (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-orange-800 text-sm">Cảnh báo lây nhiễm chéo!</h4>
                <p className="text-sm text-orange-700 mt-1">Công nhân Đinh Văn Nam có tần suất di chuyển liên khu vực cao, đặc biệt giữa <b>Khu cách ly</b> và <b>Chuồng đẻ 1</b>. Đề nghị cách ly tạm thời và phun sát trùng khu vực đi qua.</p>
              </div>
            </div>
          )}

          {/* Timeline / Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={18} className="text-indigo-600" /> Timeline di chuyển (30 ngày)
              </h3>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Lọc theo chuồng..." 
                  className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-4 py-3">Thời gian</th>
                    <th className="px-4 py-3">Khu vực / Chuồng</th>
                    <th className="px-4 py-3">Thiết bị</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Ghi chú rủi ro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employeeLogs.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center">Không tìm thấy dữ liệu</td></tr>
                  ) : employeeLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700">
                        {new Date(log.scan_time).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">
                        {log.checkpoints.checkpoint_name}
                      </td>
                      <td className="px-4 py-3 text-xs">{log.finger_scan_devices.device_name}</td>
                      <td className="px-4 py-3">
                        {log.decision === 'allow' && <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold"><CheckCircle size={12} className="mr-1"/> Hợp lệ</span>}
                        {log.decision === 'warning' && <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold"><AlertTriangle size={12} className="mr-1"/> Cảnh báo</span>}
                        {log.decision === 'deny' && <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold"><X size={12} className="mr-1"/> Vi phạm</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate" title={log.reason}>
                        {log.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
