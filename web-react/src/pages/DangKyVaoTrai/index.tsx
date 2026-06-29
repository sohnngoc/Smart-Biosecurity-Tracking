import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, X, FileText, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export default function DangKyVaoTrai() {
  const { farmId } = useOutletContext<{ farmId: string }>();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    requester_name: '',
    visitor_type: 'contractor',
    phone: '',
    plate_number: '',
    entry_date: '',
    session_type: 'full_day',
    purpose: '',
    needs_isolation_access: false,
    swab_result: 'pending',
    contact_person: ''
  });

  useEffect(() => {
    if (farmId) fetchRequests();
  }, [farmId]);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('farm_entry_requests')
      .select('*')
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false });
    
    if (data) setRequests(data);
    setLoading(false);
  };

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await supabase.from('farm_entry_requests').insert({
      ...formData,
      farm_id: farmId,
      status: 'submitted'
    });
    setIsModalOpen(false);
    fetchRequests();
    alert('Đã gửi yêu cầu đăng ký vào trại!');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold flex items-center"><Clock size={12} className="mr-1"/> Chờ duyệt</span>;
      case 'approved': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold flex items-center"><CheckCircle size={12} className="mr-1"/> Đã duyệt</span>;
      case 'rejected': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold flex items-center"><XCircle size={12} className="mr-1"/> Từ chối</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <FileText className="mr-3 text-blue-600 dark:text-blue-400" size={28} />
            Đăng ký vào trại (Khách / Thầu phụ)
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gửi yêu cầu khai báo y tế, xét nghiệm Swab trước khi vào trại</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <Plus size={18} className="mr-2" /> Tạo yêu cầu mới
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center text-gray-500">Đang tải...</div>
        ) : requests.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">Chưa có yêu cầu nào.</div>
        ) : (
          requests.map(req => (
            <div key={req.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{req.requester_name}</h3>
                {getStatusBadge(req.status)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p>👤 Loại: <span className="font-medium text-gray-800 dark:text-gray-200 uppercase">{req.visitor_type}</span></p>
                <p>📅 Ngày vào: <span className="font-medium text-gray-800 dark:text-gray-200">{req.entry_date} ({req.session_type})</span></p>
                <p>🚗 Biển số: <span className="font-medium text-gray-800 dark:text-gray-200">{req.plate_number || 'Không có xe'}</span></p>
                <p className="flex items-center gap-2 mt-2 pt-2 border-t dark:border-gray-700">
                  🧬 Kết quả Swab: 
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${req.swab_result === 'negative' ? 'bg-green-100 text-green-700' : req.swab_result === 'positive' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {req.swab_result}
                  </span>
                </p>
                {req.needs_isolation_access && (
                  <p className="flex items-center text-orange-600 text-xs font-bold bg-orange-50 p-1.5 rounded">
                    <AlertTriangle size={14} className="mr-1" /> Có yêu cầu vào khu CÁCH LY
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
              <h3 className="text-xl font-bold">Form đăng ký vào trại</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <form id="entry-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Họ tên người vào</label>
                    <input required name="requester_name" value={formData.requester_name} onChange={handleInputChange} className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                    <input required name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Loại khách</label>
                    <select name="visitor_type" value={formData.visitor_type} onChange={handleInputChange} className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600">
                      <option value="contractor">Nhà thầu / Thi công</option>
                      <option value="guest">Khách tham quan</option>
                      <option value="vet">Bác sĩ / Kỹ thuật ngoài</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Biển số xe (nếu có)</label>
                    <input name="plate_number" value={formData.plate_number} onChange={handleInputChange} className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ngày vào dự kiến</label>
                    <input required type="date" name="entry_date" value={formData.entry_date} onChange={handleInputChange} className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ca vào</label>
                    <select name="session_type" value={formData.session_type} onChange={handleInputChange} className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600">
                      <option value="morning">Sáng (06:00 - 12:00)</option>
                      <option value="afternoon">Chiều (13:00 - 17:00)</option>
                      <option value="full_day">Cả ngày</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Mục đích công việc</label>
                  <textarea required name="purpose" value={formData.purpose} onChange={handleInputChange} className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600" rows={3}></textarea>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl space-y-3">
                  <h4 className="font-bold text-orange-800 dark:text-orange-400 flex items-center">
                    <AlertTriangle size={18} className="mr-2" /> Khai báo An toàn sinh học
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Kết quả Test Swab</label>
                      <select name="swab_result" value={formData.swab_result} onChange={handleInputChange} className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600">
                        <option value="pending">Chờ test tại cổng</option>
                        <option value="negative">Âm tính (Có giấy xác nhận)</option>
                        <option value="positive">Dương tính (Cấm vào)</option>
                      </select>
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" name="needs_isolation_access" checked={formData.needs_isolation_access} onChange={handleInputChange} className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Cần vào Khu Cách Ly</span>
                      </label>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-5 border-t dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700">Hủy</button>
              <button type="submit" form="entry-form" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md">Gửi Đăng Ký</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
