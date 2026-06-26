import { useState, useEffect } from 'react';
import { getPendingVetApprovalRequests, approveVisitRequest, rejectVisitRequest, requestMoreInfoVisitRequest, statusMap, visitSessionMap, swabResultMap } from '../../lib/visitRequestLogic';
import type { FarmVisitRequest } from '../../lib/visitRequestLogic';
import { CheckCircle, XCircle, AlertCircle, FileText, X } from 'lucide-react';
import { useOutletContext} from 'react-router-dom';

export default function DuyetVaoTrai() {
  const { farmId } = useOutletContext<{ farmId: string }>();
  const [requests, setRequests] = useState<FarmVisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedReq, setSelectedReq] = useState<FarmVisitRequest | null>(null);
  const [vetNote, setVetNote] = useState('');
  const [actionReason, setActionReason] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getPendingVetApprovalRequests();
      let filteredData = data as any;
      if (farmId) {
        filteredData = filteredData.filter((req: any) => req.farm_id === farmId);
      }
      setRequests(filteredData);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (action: 'approve' | 'reject' | 'more_info') => {
    if (!selectedReq?.id) return;

    try {
      if (action === 'approve') {
        if (selectedReq.swab_result === 'positive') {
          alert('Không thể duyệt: Yêu cầu có kết quả xét nghiệm Dương tính!');
          return;
        }
        if (selectedReq.swab_result === 'pending') {
          if (!confirm('Cảnh báo: Yêu cầu này đang chờ kết quả xét nghiệm. Bạn có chắc chắn muốn duyệt?')) {
            return;
          }
        }
        await approveVisitRequest(selectedReq.id, vetNote);
      } else if (action === 'reject') {
        if (!actionReason.trim()) {
          alert('Vui lòng nhập lý do từ chối vào ô Lý do / Yêu cầu thêm');
          return;
        }
        await rejectVisitRequest(selectedReq.id, actionReason, vetNote);
      } else {
        if (!actionReason.trim()) {
          alert('Vui lòng nhập thông tin cần bổ sung vào ô Lý do / Yêu cầu thêm');
          return;
        }
        await requestMoreInfoVisitRequest(selectedReq.id, actionReason, vetNote);
      }
      
      alert('Đã xử lý yêu cầu thành công!');
      setSelectedReq(null);
      setVetNote('');
      setActionReason('');
      fetchRequests();
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Duyệt Đăng Ký Vào Trại (Vet)</h1>
        <p className="text-gray-500 text-sm mt-1">Danh sách các yêu cầu đang chờ Bác sĩ thú y xét duyệt</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người đăng ký</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trại / Dự kiến vào</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mục đích</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Swab</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Hiện không có yêu cầu nào chờ duyệt</td></tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{req.requester_name}</div>
                      <div className="text-xs text-gray-500">{req.department} - {req.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-800">{req.farm?.farm_name}</div>
                      <div className="text-sm text-gray-600">{new Date(req.estimated_visit_date).toLocaleDateString('vi-VN')} ({visitSessionMap[req.visit_session]})</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {req.visit_purpose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!req.swab_available ? (
                        <span className="text-xs text-gray-400">Không có</span>
                      ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          req.swab_result === 'negative' ? 'bg-green-100 text-green-800' :
                          req.swab_result === 'positive' ? 'bg-red-100 text-red-800 animate-pulse' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {swabResultMap[req.swab_result || '']}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[req.status || 'draft']?.color || 'bg-gray-100 text-gray-800'}`}>
                        {statusMap[req.status || 'draft']?.label || req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => { setSelectedReq(req); setVetNote(''); setActionReason(''); }}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg"
                      >
                        Xem & Duyệt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer / Modal */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50">
          <div className="bg-white h-full w-full max-w-lg shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <FileText className="mr-2 text-blue-600" size={24} />
                Chi tiết Đăng ký
              </h2>
              <button onClick={() => setSelectedReq(null)} className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {selectedReq.swab_result === 'positive' && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                  <div className="flex items-center text-red-800 font-bold mb-1">
                    <AlertCircle className="mr-2" size={18} /> Cảnh báo nghiêm trọng
                  </div>
                  <p className="text-sm text-red-700">Yêu cầu có kết quả xét nghiệm Dương tính. Hệ thống sẽ chặn duyệt.</p>
                </div>
              )}
              {selectedReq.swab_result === 'pending' && (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-md">
                  <div className="flex items-center text-yellow-800 font-bold mb-1">
                    <AlertCircle className="mr-2" size={18} /> Cần lưu ý
                  </div>
                  <p className="text-sm text-yellow-700">Yêu cầu đang chờ kết quả xét nghiệm. Bạn có chắc muốn duyệt?</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">1. Người đăng ký</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <p><span className="text-gray-500 w-24 inline-block">Họ tên:</span> <span className="font-semibold text-gray-900">{selectedReq.requester_name}</span></p>
                  <p><span className="text-gray-500 w-24 inline-block">Bộ phận:</span> <span className="text-gray-900">{selectedReq.department}</span></p>
                  <p><span className="text-gray-500 w-24 inline-block">Chức vụ:</span> <span className="text-gray-900">{selectedReq.position}</span></p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">2. Lịch trình</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <p><span className="text-gray-500 w-24 inline-block">Trại:</span> <span className="font-semibold text-blue-600">{selectedReq.farm?.farm_name}</span></p>
                  <p><span className="text-gray-500 w-24 inline-block">Ngày:</span> <span className="text-gray-900">{new Date(selectedReq.estimated_visit_date).toLocaleDateString('vi-VN')} ({visitSessionMap[selectedReq.visit_session]})</span></p>
                  <p><span className="text-gray-500 w-24 inline-block">Mục đích:</span> <span className="text-gray-900">{selectedReq.visit_purpose}</span></p>
                  {selectedReq.visit_purpose_detail && (
                    <p><span className="text-gray-500 block mb-1">Chi tiết mục đích:</span> <span className="text-gray-900 block bg-white p-2 border rounded">{selectedReq.visit_purpose_detail}</span></p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">3. Phương tiện</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-sm">
                  {selectedReq.has_vehicle ? (
                    <p><span className="text-gray-500 w-24 inline-block">Biển số xe:</span> <span className="font-semibold text-gray-900">{selectedReq.vehicle_plate_number || 'Chưa nhập'}</span></p>
                  ) : (
                    <p className="text-gray-500 italic">Không sử dụng xe vào vùng kiểm soát</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">4. ATSH / Xét nghiệm</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  {!selectedReq.swab_available ? (
                    <p className="text-gray-500 italic">Không có yêu cầu xét nghiệm</p>
                  ) : (
                    <>
                      <p><span className="text-gray-500 w-24 inline-block">Kết quả:</span> <span className="font-semibold text-gray-900">{swabResultMap[selectedReq.swab_result || '']}</span></p>
                      <p><span className="text-gray-500 w-24 inline-block">Ngày lấy:</span> <span className="text-gray-900">{selectedReq.swab_date ? new Date(selectedReq.swab_date).toLocaleDateString('vi-VN') : '---'}</span></p>
                    </>
                  )}
                </div>
              </div>

              {selectedReq.requester_note && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Ghi chú của người đi</h3>
                  <div className="bg-yellow-50 rounded-lg p-4 text-sm italic text-gray-700">
                    "{selectedReq.requester_note}"
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Ghi chú nội bộ của BSTY (Sẽ lưu cùng request)</label>
                <textarea 
                  value={vetNote} onChange={e => setVetNote(e.target.value)}
                  placeholder="Ghi chú nội bộ cho BSTY khác..."
                  className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 mb-4" rows={2}
                />

                <label className="block text-sm font-bold text-gray-700 mb-2">Lý do từ chối / Yêu cầu thêm (Bắt buộc nếu Reject/More Info)</label>
                <textarea 
                  value={actionReason} onChange={e => setActionReason(e.target.value)}
                  placeholder="Nhập lý do gửi về cho người đăng ký..."
                  className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" rows={2}
                />
              </div>

            </div>

            <div className="p-6 border-t bg-gray-50 grid grid-cols-3 gap-3">
              <button 
                onClick={() => handleAction('more_info')}
                className="col-span-1 bg-orange-100 text-orange-700 py-2.5 rounded-lg hover:bg-orange-200 font-semibold flex flex-col justify-center items-center text-sm transition"
              >
                <AlertCircle size={18} className="mb-1" />
                Cần thêm thông tin
              </button>
              <button 
                onClick={() => handleAction('reject')}
                className="col-span-1 bg-red-100 text-red-700 py-2.5 rounded-lg hover:bg-red-200 font-semibold flex flex-col justify-center items-center text-sm transition"
              >
                <XCircle size={18} className="mb-1" />
                Từ chối
              </button>
              <button 
                onClick={() => handleAction('approve')}
                className="col-span-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-semibold flex flex-col justify-center items-center text-sm transition shadow-md"
              >
                <CheckCircle size={18} className="mb-1" />
                Duyệt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
