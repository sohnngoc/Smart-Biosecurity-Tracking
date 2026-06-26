import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useOutletContext} from 'react-router-dom';
import { Cpu, Truck, Users, WifiOff, AlertTriangle, CheckCircle, Navigation } from 'lucide-react';

export default function MoPhongIoT() {
  const { farmId } = useOutletContext<{ farmId: string }>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [selectedZone, setSelectedZone] = useState(localStorage.getItem('iot_selected_zone') || '');

  useEffect(() => {
    const handleZoneChange = () => {
      setSelectedZone(localStorage.getItem('iot_selected_zone') || '');
    };
    window.addEventListener('iot_zone_changed', handleZoneChange);
    window.addEventListener('storage', handleZoneChange);
    return () => {
      window.removeEventListener('iot_zone_changed', handleZoneChange);
      window.removeEventListener('storage', handleZoneChange);
    };
  }, []);

  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const zone = e.target.value;
    setSelectedZone(zone);
    if (zone) {
      localStorage.setItem('iot_selected_zone', zone);
    } else {
      localStorage.removeItem('iot_selected_zone');
    }
    window.dispatchEvent(new Event('iot_zone_changed'));
  };

  const simulateEvent = async (actionType: string) => {
    setLoading(true);
    setMessage(null);

    try {
      // Logic giả lập sự kiện IoT ở đây
      let alertMsg = '';
      let severity = 'Thấp';
      let title = '';

      switch (actionType) {
        case 'RFID_XE':
          title = 'Mô phỏng quét RFID xe';
          alertMsg = 'Đã quét RFID xe 93C-67890 tại Cổng Chính.';
          severity = 'Thấp';
          break;
        case 'GPS_XE_VUNG_CAM':
          title = 'Mô phỏng xe đi vào vùng cấm';
          alertMsg = 'Xe 93C-67890 đi vào Vùng Cấm mà không có quyền.';
          severity = 'Cao';
          break;
        case 'UWB_NGUOI':
          title = 'Mô phỏng UWB người vào chuồng';
          alertMsg = 'Nhân viên NV-001 (Lê Thị Thu) đã vào Chuồng Nái 01.';
          severity = 'Thấp';
          break;
        case 'UWB_NGUOI_SAI_VUNG':
          title = 'Mô phỏng người đi sai vùng';
          alertMsg = 'Bảo vệ NV-003 đi vào Chuồng Nái khi chưa tắm sát trùng.';
          severity = 'Nghiêm trọng';
          break;
        case 'MAT_TIN_HIEU':
          title = 'Mô phỏng thiết bị mất tín hiệu';
          alertMsg = 'UWB Anchor tại Chuồng Nái 01 đã mất tín hiệu.';
          severity = 'Trung bình';
          break;
        case 'HOAN_TAT_VE_SINH':
          title = 'Mô phỏng hoàn tất vệ sinh';
          alertMsg = 'Tổ vệ sinh đã hoàn tất công việc làm sạch Chuồng Nái 01 (đủ 45 phút).';
          severity = 'Thấp';
          break;
        default:
          break;
      }

      if (severity === 'Cao' || severity === 'Nghiêm trọng' || severity === 'Trung bình') {
         await supabase.from('alerts').insert({
            farm_id: farmId,
            alert_code: `SIM-${Date.now().toString().slice(-6)}`,
            alert_type: title,
            severity: severity,
            message: alertMsg,
            status: 'Chưa xử lý'
         });
         setMessage({ text: `Đã tạo cảnh báo: ${alertMsg}`, type: 'error' });
      } else {
         setMessage({ text: `Sự kiện thành công: ${alertMsg}`, type: 'success' });
      }

      // Cập nhật lại farm's last_updated
      await supabase.from('farms').update({ last_updated_at: new Date().toISOString() }).eq('id', farmId);

    } catch (err: any) {
      setMessage({ text: `Lỗi: ${err.message}`, type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center text-gray-700 mb-6">
          <Cpu className="mr-2 text-blue-600" size={28} />
          <div>
            <h2 className="text-xl font-bold">Bộ Mô Phỏng Thiết Bị IoT</h2>
            <p className="text-sm text-gray-500">Giả lập tín hiệu phần cứng để kiểm thử luồng dữ liệu và cảnh báo</p>
          </div>
        </div>

        <div className="mb-6 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">Chọn khu vực đang Test (Đồng bộ Bản đồ 3D & Tổng quan)</label>
          <select 
            value={selectedZone}
            onChange={handleZoneChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5 bg-white border"
          >
            <option value="">-- Không test khu vực nào --</option>
            <option value="de1">Chuồng Đẻ 1</option>
            <option value="de2">Chuồng Đẻ 2</option>
            <option value="de3">Chuồng Đẻ 3</option>
            <option value="bau1">Chuồng Bầu 1</option>
            <option value="bau2">Chuồng Bầu 2</option>
            <option value="duc">Chuồng Đực</option>
            <option value="cach_ly">Khu Cách Ly</option>
            <option value="sinh_hoat">Khu Sinh Hoạt</option>
            <option value="tam">Khu Tắm/Thay đồ</option>
            <option value="kho">Kho Thuốc/Dụng cụ</option>
            <option value="sat_trung">Khu Sát Trùng Xe</option>
            <option value="cong">Nhà Bảo Vệ (Cổng)</option>
          </select>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 flex items-start ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.type === 'success' ? <CheckCircle className="mr-2 mt-0.5 shrink-0" size={18} /> : <AlertTriangle className="mr-2 mt-0.5 shrink-0" size={18} />}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">RFID & Vị trí Xe (GPS)</h3>
            <button 
              onClick={() => simulateEvent('RFID_XE')} disabled={loading}
              className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 py-3 px-4 rounded-lg border border-blue-200 transition font-medium text-sm flex items-center justify-between"
            >
              <span className="flex items-center"><Truck size={18} className="mr-2" /> Quét RFID xe vào cổng</span>
              <span className="text-xs bg-white px-2 py-1 rounded text-blue-500">Simulate</span>
            </button>
            <button 
              onClick={() => simulateEvent('GPS_XE_VUNG_CAM')} disabled={loading}
              className="w-full bg-red-50 text-red-700 hover:bg-red-100 py-3 px-4 rounded-lg border border-red-200 transition font-medium text-sm flex items-center justify-between"
            >
              <span className="flex items-center"><Navigation size={18} className="mr-2" /> GPS xe vào vùng cấm</span>
              <span className="text-xs bg-white px-2 py-1 rounded text-red-500">Cảnh báo</span>
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">Nhân sự (UWB/RFID)</h3>
            <button 
              onClick={() => simulateEvent('UWB_NGUOI')} disabled={loading}
              className="w-full bg-green-50 text-green-700 hover:bg-green-100 py-3 px-4 rounded-lg border border-green-200 transition font-medium text-sm flex items-center justify-between"
            >
              <span className="flex items-center"><Users size={18} className="mr-2" /> UWB người vào khu sạch</span>
              <span className="text-xs bg-white px-2 py-1 rounded text-green-500">Simulate</span>
            </button>
            <button 
              onClick={() => simulateEvent('UWB_NGUOI_SAI_VUNG')} disabled={loading}
              className="w-full bg-red-50 text-red-700 hover:bg-red-100 py-3 px-4 rounded-lg border border-red-200 transition font-medium text-sm flex items-center justify-between"
            >
              <span className="flex items-center"><AlertTriangle size={18} className="mr-2" /> Người đi sai phân quyền</span>
              <span className="text-xs bg-white px-2 py-1 rounded text-red-500">Cảnh báo</span>
            </button>
          </div>

          <div className="space-y-3 mt-4">
            <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">Tình trạng Thiết bị</h3>
            <button 
              onClick={() => simulateEvent('MAT_TIN_HIEU')} disabled={loading}
              className="w-full bg-orange-50 text-orange-700 hover:bg-orange-100 py-3 px-4 rounded-lg border border-orange-200 transition font-medium text-sm flex items-center justify-between"
            >
              <span className="flex items-center"><WifiOff size={18} className="mr-2" /> Thiết bị mất tín hiệu</span>
              <span className="text-xs bg-white px-2 py-1 rounded text-orange-500">Simulate</span>
            </button>
          </div>

          <div className="space-y-3 mt-4">
            <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">Vệ sinh sát trùng</h3>
            <button 
              onClick={() => simulateEvent('HOAN_TAT_VE_SINH')} disabled={loading}
              className="w-full bg-teal-50 text-teal-700 hover:bg-teal-100 py-3 px-4 rounded-lg border border-teal-200 transition font-medium text-sm flex items-center justify-between"
            >
              <span className="flex items-center"><CheckCircle size={18} className="mr-2" /> Xác nhận vệ sinh chuồng</span>
              <span className="text-xs bg-white px-2 py-1 rounded text-teal-500">Simulate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
