import { useState, useEffect } from 'react';
import { useOutletContext} from 'react-router-dom';
import { Cpu, Search, Plus, Wifi, Radio } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const generateMockDevices = () => {
  const devices = [
    // GPS
    { id: 'gps_base', device_type: 'GPS', device_name: 'GPS Base Station', location: 'Cổng chính', status: 'Hoạt động' },
    
    // RFID
    { id: 'rfid_cong_xe', device_type: 'RFID', device_name: 'RFID Cổng Xe', location: 'Cổng chính', status: 'Hoạt động' },
    { id: 'rfid_nha_bao_ve', device_type: 'RFID', device_name: 'RFID Nhà Bảo Vệ', location: 'Nhà bảo vệ', status: 'Hoạt động' },
    { id: 'rfid_truoc_tam', device_type: 'RFID', device_name: 'RFID Trước Tắm', location: 'Khu tắm / Thay đồ', status: 'Hoạt động' },
    { id: 'rfid_sau_tam', device_type: 'RFID', device_name: 'RFID Sau Tắm', location: 'Khu tắm / Thay đồ', status: 'Hoạt động' },
    { id: 'rfid_kho', device_type: 'RFID', device_name: 'RFID Kho', location: 'Kho thuốc / Dụng cụ', status: 'Hoạt động' },
    { id: 'rfid_heo_chet', device_type: 'RFID', device_name: 'RFID Xử Lý Heo Chết', location: 'Xử lý heo chết', status: 'Hoạt động' },
    { id: 'rfid_kiem_ke', device_type: 'RFID', device_name: 'RFID Kiểm Kê', location: 'Phòng kiểm kê', status: 'Hoạt động' },
    { id: 'rfid_cach_ly', device_type: 'RFID', device_name: 'RFID Cách Ly', location: 'Cách ly', status: 'Hoạt động' },
    
    // UWB
    { id: 'uwb_sat_trung', device_type: 'UWB', device_name: 'UWB Sát Trùng Xe', location: 'Khu sát trùng xe', status: 'Hoạt động' },
    { id: 'uwb_tam', device_type: 'UWB', device_name: 'UWB Khu Tắm', location: 'Khu tắm / Thay đồ', status: 'Hoạt động' },
    { id: 'uwb_hanh_lang', device_type: 'UWB', device_name: 'UWB Hành Lang', location: 'Hành lang chính', status: 'Hoạt động' },
    { id: 'uwb_xuat_nhap', device_type: 'UWB', device_name: 'UWB Xuất Nhập Heo', location: 'Khu xuất nhập heo', status: 'Hoạt động' },
    { id: 'uwb_heo_chet', device_type: 'UWB', device_name: 'UWB Xử Lý Heo Chết', location: 'Xử lý heo chết', status: 'Hoạt động' },
    { id: 'uwb_cach_ly', device_type: 'UWB', device_name: 'UWB Cách Ly', location: 'Cách ly', status: 'Hoạt động' },
  ];

  const barnConfigs = [
    { prefix: 'de3', name: 'Chuồng Đẻ 3' },
    { prefix: 'de2', name: 'Chuồng Đẻ 2' },
    { prefix: 'de1', name: 'Chuồng Đẻ 1' },
    { prefix: 'bau2', name: 'Chuồng Bầu 2' },
    { prefix: 'bau1', name: 'Chuồng Bầu 1' },
    { prefix: 'duc', name: 'Chuồng Đực' },
  ];

  barnConfigs.forEach(b => {
    devices.push({ id: `rfid_${b.prefix}`, device_type: 'RFID', device_name: `RFID Cửa ${b.name}`, location: b.name, status: 'Hoạt động' });
    devices.push({ id: `uwb_${b.prefix}_1`, device_type: 'UWB', device_name: `UWB Góc 1`, location: b.name, status: 'Hoạt động' });
    devices.push({ id: `uwb_${b.prefix}_2`, device_type: 'UWB', device_name: `UWB Góc 2`, location: b.name, status: 'Hoạt động' });
    devices.push({ id: `uwb_${b.prefix}_3`, device_type: 'UWB', device_name: `UWB Góc 3`, location: b.name, status: 'Hoạt động' });
    devices.push({ id: `uwb_${b.prefix}_4`, device_type: 'UWB', device_name: `UWB Góc 4`, location: b.name, status: 'Hoạt động' });
  });

  return devices;
};

export default function ThietBi() {
  const { farmId } = useOutletContext<{ farmId: string }>();
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: ReturnType<typeof supabase.channel>;

    const fetchDevices = async () => {
      setLoading(true);
      // Kiểm tra xem có cảnh báo S3 (mất kết nối thiết bị) đang active không
      let hasAlertS3 = false;
      if (farmId) {
        const { data } = await supabase
          .from('alerts')
          .select('alert_code')
          .eq('farm_id', farmId)
          .eq('status', 'Chưa xử lý')
          .like('alert_code', '%-S3-%');
        
        hasAlertS3 = (data && data.length > 0) || false;
      }

      // Khởi tạo thiết bị mock
      let mockDevices = generateMockDevices();
      
      // Nếu có cảnh báo S3, cập nhật trạng thái mất tín hiệu cho uwb_cach_ly và uwb_de3_1
      if (hasAlertS3) {
        mockDevices = mockDevices.map(d => {
          if (d.id === 'uwb_cach_ly' || d.id === 'uwb_de3_1') {
            return { ...d, status: 'Mất kết nối' };
          }
          return d;
        });
        
        // Đẩy 2 thiết bị lỗi lên đầu danh sách để dễ thấy
        const errorDevices = mockDevices.filter(d => d.status === 'Mất kết nối');
        const normalDevices = mockDevices.filter(d => d.status !== 'Mất kết nối');
        mockDevices = [...errorDevices, ...normalDevices];
      }
      
      setDevices(mockDevices);
      setLoading(false);
    };

    fetchDevices();

    // Lắng nghe realtime các thay đổi của bảng alerts
    if (farmId) {
      subscription = supabase
        .channel(`public:alerts_devices`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'alerts', filter: `farm_id=eq.${farmId}` },
          () => fetchDevices()
        )
        .subscribe();
    }

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [farmId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center text-gray-700">
          <Cpu className="mr-2 text-blue-600" />
          <h2 className="text-lg font-bold">Quản lý Thiết bị IoT</h2>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Tìm kiếm thiết bị..." className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center">
            <Plus size={18} className="mr-1" /> Thêm thiết bị
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                <th className="p-4 font-semibold">Tên Thiết bị</th>
                <th className="p-4 font-semibold">Loại sóng</th>
                <th className="p-4 font-semibold">Vị trí lắp đặt</th>
                <th className="p-4 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan={4} className="p-4 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : devices.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center text-gray-500">Không có dữ liệu thiết bị</td></tr>
              ) : (
                devices.map((d) => (
                  <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{d.device_name}<br/><span className="text-xs text-gray-400">{d.id}</span></td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-max ${
                        d.device_type === 'RFID' ? 'bg-blue-100 text-blue-700' : 
                        d.device_type === 'UWB' ? 'bg-purple-100 text-purple-700' : 
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {d.device_type === 'RFID' && <Radio size={12} className="mr-1" />}
                        {d.device_type === 'UWB' && <Wifi size={12} className="mr-1" />}
                        {d.device_type}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{d.location}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        d.status === 'Mất kết nối' ? 'bg-red-100 text-red-700 animate-pulse font-bold' : 'bg-green-100 text-green-700'
                      }`}>
                        {d.status}
                      </span>
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
