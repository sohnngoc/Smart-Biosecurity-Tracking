import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { getMyVisitRequests, statusMap, visitSessionMap } from '../../lib/visitRequestLogic';
import type { FarmVisitRequest } from '../../lib/visitRequestLogic';
import { Plus, X, FileText } from 'lucide-react';
import { useOutletContext} from 'react-router-dom';

export default function DangKyVaoTrai() {
  const { farmId } = useOutletContext<{ farmId: string }>();
  const [requests, setRequests] = useState<FarmVisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [farms, setFarms] = useState<any[]>([]);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFarm, setFilterFarm] = useState('');

  // Form states
  const [formData, setFormData] = useState<Partial<FarmVisitRequest>>({
    farm_id: farmId,
    department: 'Vet',
    position: 'Vet',
    has_vehicle: false,
    visit_session: 'full_day',
    visit_purpose: 'Kiểm tra thú y',
    swab_available: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchFarms = async () => {
    // Nếu có farmId trên url, ta có thể chỉ lấy thông tin trại đó hoặc vẫn lấy tất cả
    const { data } = await supabase.from('farms').select('id, farm_name').order('farm_name');
    if (data) setFarms(data);
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getMyVisitRequests();
      setRequests(data as any);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFarms();
    fetchRequests();
  }, []);

  const handleCreate = async () => {
    try {
      setErrorMsg('');
      if (!formData.farm_id || !formData.requester_name || !formData.estimated_visit_date) {
        throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
      }
      setIsSubmitting(true);
      
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      const payload = {
        ...formData,
        requester_id: userId,
        status: 'pending_vet_approval'
      };

      const { error } = await supabase.from('farm_visit_requests').insert([payload]);
      if (error) throw error;
      
      setIsModalOpen(false);
      fetchRequests();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filterStatus && req.status !== filterStatus) return false;
    if (filterFarm && req.farm_id !== filterFarm) return false;
    // Nếu trong context 1 trại, có thể tự động filter? Tuy nhiên cứ để filter theo farm_id hiện hành
    if (farmId && req.farm_id !== farmId) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Đăng Ký Vào Trại</h1>
          <p className="text-gray-500 text-sm mt-1">Danh sách yêu cầu vào trại của bạn</p>
        </div>
        <button 
          onClick={() => {
            setFormData({
              farm_id: farmId,
              department: 'Vet',
              position: 'Vet',
              has_vehicle: false,
              visit_session: 'full_day',
              visit_purpose: 'Kiểm tra thú y',
              swab_available: false,
            });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition shadow"
        >
          <Plus size={18} className="mr-2" />
          Tạo yêu cầu mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        {!farmId && (
          <div className="flex-1 max-w-xs">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Trại</label>
            <select 
              value={filterFarm} onChange={e => setFilterFarm(e.target.value)}
              className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 text-gray-900 shadow-sm"
            >
              <option value="">Tất cả trại</option>
              {farms.map(f => <option key={f.id} value={f.id}>{f.farm_name}</option>)}
            </select>
          </div>
        )}
        <div className="flex-1 max-w-xs">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Trạng thái</label>
          <select 
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 text-gray-900 shadow-sm"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(statusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày gửi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dự kiến vào</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buổi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mục đích</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : filteredRequests.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Không có yêu cầu nào</td></tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {req.created_at ? new Date(req.created_at).toLocaleDateString('vi-VN') : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {req.farm?.farm_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {new Date(req.estimated_visit_date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {visitSessionMap[req.visit_session] || req.visit_session}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {req.visit_purpose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[req.status || 'draft']?.color || 'bg-gray-100 text-gray-800'}`}>
                        {statusMap[req.status || 'draft']?.label || req.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Đăng Ký Mới */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <FileText className="mr-2 text-blue-600" size={24} />
                Đăng ký Yêu cầu vào Trại
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">{errorMsg}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Trại cần đến <span className="text-red-500">*</span></label>
                  <select 
                    value={formData.farm_id || ''} 
                    onChange={e => setFormData({...formData, farm_id: e.target.value})}
                    disabled={!!farmId}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 text-gray-900 dark:text-white shadow-sm transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">-- Chọn trại --</option>
                    {farms.map(f => <option key={f.id} value={f.id}>{f.farm_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Họ tên người đi <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="Nguyễn Văn A"
                    value={formData.requester_name || ''} 
                    onChange={e => setFormData({...formData, requester_name: e.target.value})}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 text-gray-900 dark:text-white shadow-sm transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bộ phận</label>
                  <select 
                    value={formData.department || ''} 
                    onChange={e => setFormData({...formData, department: e.target.value})}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 text-gray-900 dark:text-white shadow-sm transition-all duration-200"
                  >
                    <option value="Vet">Vet (Thú y)</option>
                    <option value="Production">Production (Sản xuất)</option>
                    <option value="QA">QA / Audit</option>
                    <option value="Engineering">Bảo trì / Kỹ thuật</option>
                    <option value="Transport">Vận tải / Xe cám</option>
                    <option value="Other">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Chức vụ</label>
                  <input 
                    type="text" 
                    value={formData.position || ''} 
                    onChange={e => setFormData({...formData, position: e.target.value})}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 text-gray-900 dark:text-white shadow-sm transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ngày dự kiến <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.estimated_visit_date || ''} 
                    onChange={e => setFormData({...formData, estimated_visit_date: e.target.value})}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 text-gray-900 dark:text-white shadow-sm transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Buổi</label>
                  <select 
                    value={formData.visit_session || 'full_day'} 
                    onChange={e => setFormData({...formData, visit_session: e.target.value as any})}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 text-gray-900 dark:text-white shadow-sm transition-all duration-200"
                  >
                    <option value="morning">Sáng</option>
                    <option value="afternoon">Chiều</option>
                    <option value="full_day">Cả ngày</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mục đích vào trại <span className="text-red-500">*</span></label>
                  <select 
                    value={formData.visit_purpose || ''} 
                    onChange={e => setFormData({...formData, visit_purpose: e.target.value})}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 text-gray-900 dark:text-white shadow-sm transition-all duration-200 mb-2"
                  >
                    <option value="Kiểm tra thú y">Kiểm tra thú y</option>
                    <option value="Kiểm tra ATSH">Kiểm tra An toàn sinh học</option>
                    <option value="Sửa chữa/Bảo trì">Sửa chữa / Bảo trì</option>
                    <option value="Giao hàng/Xe cám">Giao hàng / Xe cám</option>
                    <option value="Khác">Khác</option>
                  </select>
                  {formData.visit_purpose === 'Khác' && (
                    <textarea 
                      placeholder="Mô tả chi tiết mục đích..."
                      value={formData.visit_purpose_detail || ''}
                      onChange={e => setFormData({...formData, visit_purpose_detail: e.target.value})}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 text-gray-900 dark:text-white shadow-sm transition-all duration-200 mt-2"
                      rows={2}
                    ></textarea>
                  )}
                </div>

                <div>
                  <div className="flex items-center mt-6">
                    <input 
                      type="checkbox" 
                      id="has_vehicle"
                      checked={formData.has_vehicle || false}
                      onChange={e => setFormData({...formData, has_vehicle: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="has_vehicle" className="ml-2 block text-sm text-gray-900 font-medium">
                      Có xe đi cùng vào vùng kiểm soát
                    </label>
                  </div>
                </div>
                <div>
                  {formData.has_vehicle && (
                    <>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Biển số xe</label>
                      <input 
                        type="text" 
                        placeholder="Ví dụ: 51H-123.45"
                        value={formData.vehicle_plate_number || ''} 
                        onChange={e => setFormData({...formData, vehicle_plate_number: e.target.value})}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 text-gray-900 dark:text-white shadow-sm transition-all duration-200"
                      />
                    </>
                  )}
                </div>

                <div className="col-span-2 border-t pt-4 mt-2">
                  <h3 className="text-sm font-bold text-gray-800 mb-4">Kết quả Swab / Xét nghiệm</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <div className="flex items-center mb-3">
                        <input 
                          type="checkbox" 
                          id="swab_available"
                          checked={formData.swab_available || false}
                          onChange={e => setFormData({...formData, swab_available: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="swab_available" className="ml-2 block text-sm text-gray-900 font-medium">
                          Có yêu cầu xét nghiệm (Swab)
                        </label>
                      </div>
                      {formData.swab_available && (
                        <>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kết quả</label>
                          <select 
                            value={formData.swab_result || 'pending'} 
                            onChange={e => setFormData({...formData, swab_result: e.target.value as any})}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 text-gray-900 dark:text-white shadow-sm transition-all duration-200"
                          >
                            <option value="pending">Đang chờ kết quả</option>
                            <option value="negative">Âm tính</option>
                            <option value="positive">Dương tính</option>
                          </select>
                        </>
                      )}
                    </div>
                    {formData.swab_available && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ngày lấy mẫu</label>
                        <input 
                          type="date" 
                          value={formData.swab_date || ''} 
                          onChange={e => setFormData({...formData, swab_date: e.target.value})}
                          className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 text-gray-900 dark:text-white shadow-sm transition-all duration-200"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-2 border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ghi chú thêm</label>
                  <textarea 
                    value={formData.requester_note || ''}
                    onChange={e => setFormData({...formData, requester_note: e.target.value})}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2.5 text-gray-900 dark:text-white shadow-sm transition-all duration-200"
                    rows={2}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="p-5 border-t bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
              >
                Hủy
              </button>
              <button 
                onClick={handleCreate}
                disabled={isSubmitting}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi cho BSTY Duyệt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
