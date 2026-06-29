import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { CheckCircle, XCircle, AlertCircle, FileText, X, AlertTriangle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export default function DuyetVaoTrai() {
  const { farmId } = useOutletContext<{ farmId: string }>();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [actionReason, setActionReason] = useState('');
  const [highRiskFlag, setHighRiskFlag] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('farm_entry_requests')
      .select('*')
      .eq('farm_id', farmId)
      .eq('status', 'submitted')
      .order('created_at', { ascending: false });
    
    if (data) setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    if (farmId) fetchRequests();
  }, [farmId]);

  const handleAction = async (action: 'approved' | 'rejected') => {
    if (!selectedReq?.id) return;

    if (action === 'approved') {
      if (selectedReq.swab_result === 'positive') {
        alert('Không thể duyệt: Kết quả xét nghiệm Dương tính!');
        return;
      }
      if (selectedReq.swab_result === 'pending') {
        if (!confirm('Yêu cầu này chưa có kết quả xét nghiệm. Vẫn duyệt?')) return;
      }
    } else if (action === 'rejected' && !actionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối.');
      return;
    }

    try {
      // Create approval record
      await supabase.from('farm_entry_approvals').insert({
        request_id: selectedReq.id,
        status: action,
        reason: actionReason,
        high_risk_flag: highRiskFlag
      });

      // Update request status
      await supabase.from('farm_entry_requests').update({ status: action }).eq('id', selectedReq.id);
      
      alert('Đã xử lý yêu cầu!');
      setSelectedReq(null);
      setActionReason('');
      setHighRiskFlag(false);
      fetchRequests();
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
          <CheckCircle className="mr-3 text-green-600 dark:text-green-400" size={28} />
          Duyệt Đăng Ký Vào Trại (Vet/Admin)
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Xét duyệt các yêu cầu vào trại dựa trên ATSH</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Người đăng ký</th>
                <th className="px-6 py-4">Ngày / Ca</th>
                <th className="px-6 py-4">Mục đích</th>
                <th className="px-6 py-4">Swab / Cảnh báo</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Hiện không có yêu cầu nào chờ duyệt.</td></tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800 dark:text-gray-200">{req.requester_name}</div>
                      <div className="text-xs text-gray-500 uppercase">{req.visitor_type} - {req.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800 dark:text-gray-200">{req.entry_date}</div>
                      <div className="text-xs text-gray-500">{req.session_type}</div>
                    </td>
                    <td className="px-6 py-4">{req.purpose}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold inline-block mb-1 ${
                        req.swab_result === 'negative' ? 'bg-green-100 text-green-700' :
                        req.swab_result === 'positive' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        Swab: {req.swab_result}
                      </span>
                      {req.needs_isolation_access && (
                        <div className="text-xs font-bold text-orange-600 flex items-center mt-1">
                          <AlertTriangle size={12} className="mr-1" /> Cần vào Cách Ly
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { setSelectedReq(req); setActionReason(''); setHighRiskFlag(false); }}
                        className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg font-medium transition"
                      >
                        Xét Duyệt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReq && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
              <h2 className="text-xl font-bold flex items-center">
                <FileText className="mr-2 text-blue-600" size={24} />
                Chi tiết Đăng ký
              </h2>
              <button onClick={() => setSelectedReq(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {selectedReq.swab_result === 'positive' && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                  <div className="flex items-center text-red-800 font-bold mb-1">
                    <AlertCircle className="mr-2" size={18} /> Cảnh báo nghiêm trọng
                  </div>
                  <p className="text-sm text-red-700">Người này có kết quả Swab DƯƠNG TÍNH.</p>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500 w-24 inline-block">Họ tên:</span> <span className="font-bold">{selectedReq.requester_name}</span></p>
                <p><span className="text-gray-500 w-24 inline-block">Loại khách:</span> <span className="uppercase">{selectedReq.visitor_type}</span></p>
                <p><span className="text-gray-500 w-24 inline-block">SĐT:</span> <span>{selectedReq.phone}</span></p>
                <p><span className="text-gray-500 w-24 inline-block">Ngày vào:</span> <span className="font-medium text-blue-600">{selectedReq.entry_date} ({selectedReq.session_type})</span></p>
                <p><span className="text-gray-500 w-24 inline-block">Mục đích:</span> <span>{selectedReq.purpose}</span></p>
              </div>

              <div className="border-t dark:border-gray-700 pt-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Đánh dấu Rủi ro cao (Giám sát đặc biệt)</label>
                <label className="flex items-center space-x-2 cursor-pointer bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                  <input type="checkbox" checked={highRiskFlag} onChange={e => setHighRiskFlag(e.target.checked)} className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800 dark:text-orange-400">Yêu cầu theo dõi sát (High Risk)</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Lý do từ chối (nếu có)</label>
                <textarea 
                  value={actionReason} onChange={e => setActionReason(e.target.value)}
                  placeholder="Nhập lý do gửi về cho người đăng ký..."
                  className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500" rows={2}
                />
              </div>
            </div>

            <div className="p-5 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
              <button 
                onClick={() => handleAction('rejected')}
                className="px-6 py-2 bg-red-100 text-red-700 hover:bg-red-200 font-semibold rounded-lg transition flex items-center"
              >
                <XCircle size={18} className="mr-2" /> Từ chối
              </button>
              <button 
                onClick={() => handleAction('approved')}
                className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 font-semibold rounded-lg shadow-md transition flex items-center"
              >
                <CheckCircle size={18} className="mr-2" /> Phê Duyệt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
