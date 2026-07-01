import { X, Search, Users, ShieldAlert, CheckCircle, AlertTriangle, MapPin, Calendar, Clock } from 'lucide-react';
import { globalMockLogs } from '../../../data/mockAccessLogs';
import { useState, useMemo } from 'react';

interface Props {
  onClose: () => void;
}

export default function TraceBarnDashboard({ onClose }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Lọc chỉ log của Chuồng đẻ 1
  const barnLogs = useMemo(() => {
    let logs = globalMockLogs.filter(l => l.checkpoints.checkpoint_name === 'Chuồng đẻ 1');
    if (searchTerm) {
      logs = logs.filter(l => 
        l.employees.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        l.employees.employee_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return logs;
  }, [searchTerm]);

  const totalLogs = barnLogs.length;
  const uniqueEmployees = new Set(barnLogs.map(l => l.employees.id)).size;
  const warnings = barnLogs.filter(l => l.decision !== 'allow').length;
  const riskLevel = warnings > 10 ? 'Nguy Cơ Cao' : (warnings > 5 ? 'Cảnh Báo' : 'Kiểm Soát');
  const riskColor = riskLevel === 'Nguy Cơ Cao' ? 'red' : (riskLevel === 'Cảnh Báo' ? 'orange' : 'emerald');

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-slate-50 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <MapPin size={150} className="text-slate-200" />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-bold border border-slate-700 uppercase tracking-wider">
                  Scenario 4
                </span>
                <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-bold border border-red-500/50 flex items-center gap-1">
                  <ShieldAlert size={14} /> Điểm nóng lây nhiễm
                </span>
              </div>
              <h2 className="text-2xl font-black mb-1">Chuồng đẻ 1</h2>
              <div className="flex gap-4 text-slate-400 text-sm font-medium">
                <span>Mã Chuồng: FAR-01</span>
                <span>•</span>
                <span>Loại: Chuồng đẻ</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-white">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <span className="text-slate-500 text-xs font-bold uppercase mb-1 flex items-center gap-1"><Clock size={14} /> Lượt người ra/vào</span>
              <span className="text-2xl font-black text-slate-800">{totalLogs}</span>
              <span className="text-xs text-slate-400 mt-1">Trong 30 ngày qua</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <span className="text-slate-500 text-xs font-bold uppercase mb-1 flex items-center gap-1"><Users size={14} /> Số nhân viên</span>
              <span className="text-2xl font-black text-indigo-600">{uniqueEmployees}</span>
              <span className="text-xs text-slate-400 mt-1">Đã từng vào chuồng</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <span className="text-slate-500 text-xs font-bold uppercase mb-1 flex items-center gap-1"><AlertTriangle size={14} /> Số lượt cảnh báo</span>
              <span className="text-2xl font-black text-orange-500">{warnings}</span>
              <span className="text-xs text-slate-400 mt-1">Vi phạm ATSH</span>
            </div>
            <div className={`p-4 rounded-xl border flex flex-col justify-center items-center text-center bg-${riskColor}-50 border-${riskColor}-200 text-${riskColor}-700`}>
              <span className="text-xs font-bold uppercase mb-1">Mức độ rủi ro</span>
              <span className="text-2xl font-black uppercase">{riskLevel}</span>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3">
            <ShieldAlert className="text-red-500 shrink-0 mt-0.5" />
            <div className="w-full">
              <h4 className="font-bold text-red-800 text-sm mb-2">Phân tích nguy cơ lây nhiễm chéo!</h4>
              <ul className="text-sm text-red-700 space-y-1 list-disc pl-4">
                <li>Có nguy cơ lây nhiễm chéo do nhân viên Đinh Văn Nam di chuyển từ Chuồng đẻ 1 sang khu nái mang thai trong cùng ngày.</li>
                <li>Phát hiện 3 nhân viên thiếu xác nhận sát trùng (không quẹt vân tay tại phòng tắm).</li>
                <li><strong className="text-red-800">Đề xuất:</strong> Khoanh vùng truy vết các khu vực liên quan và siết chặt quy trình tắm sát trùng ngay lập tức.</li>
              </ul>
            </div>
          </div>

          {/* Timeline / Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={18} className="text-indigo-600" /> Timeline Người Ra/Vào (30 ngày)
              </h3>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Tìm nhân viên (tên, mã)..." 
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
                    <th className="px-4 py-3">Nhân sự</th>
                    <th className="px-4 py-3">Vai trò</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Ghi chú rủi ro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {barnLogs.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center">Không tìm thấy dữ liệu</td></tr>
                  ) : barnLogs.map(log => {
                    const isHighRiskEmp = log.employees.employee_code === 'NV-034';
                    return (
                      <tr key={log.id} className={`hover:bg-slate-50 ${isHighRiskEmp && log.decision !== 'allow' ? 'bg-orange-50/50' : ''}`}>
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700">
                          {new Date(log.scan_time).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800 flex items-center gap-2">
                            {log.employees.full_name}
                            {isHighRiskEmp && <span title="Nhân sự nguy cơ cao" className="flex items-center"><AlertTriangle size={14} className="text-orange-500" /></span>}
                          </div>
                          <div className="text-xs text-slate-500">{log.employees.employee_code}</div>
                        </td>
                        <td className="px-4 py-3 text-xs">{log.employees.job_title}</td>
                        <td className="px-4 py-3">
                          {log.decision === 'allow' && <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold"><CheckCircle size={12} className="mr-1"/> Hợp lệ</span>}
                          {log.decision === 'warning' && <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold"><AlertTriangle size={12} className="mr-1"/> Cảnh báo</span>}
                          {log.decision === 'deny' && <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold"><X size={12} className="mr-1"/> Vi phạm</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate" title={log.reason}>
                          {log.reason}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
