import { useEffect, useState } from 'react';
import { useOutletContext} from 'react-router-dom';
import { Truck, Search, Plus } from 'lucide-react';

export const generateMockVehicles = () => [
  { id: 'v1', plate_number: '51C-123.45', vehicle_type: 'Xe cám', driver_name: 'Nguyễn Văn A', driver_phone: '0901234567', rfid_tag: 'RFID-V-001', sanitization_status: 'Đã sát trùng', current_status: 'Đang trong trại' },
  { id: 'v2', plate_number: '60C-987.65', vehicle_type: 'Xe bắt heo', driver_name: 'Trần Văn B', driver_phone: '0987654321', rfid_tag: 'RFID-V-002', sanitization_status: 'Chưa sát trùng', current_status: 'Đang chờ sát trùng' },
  { id: 'v3', plate_number: '61C-456.78', vehicle_type: 'Xe vật tư', driver_name: 'Lê Văn C', driver_phone: '0912345678', rfid_tag: 'RFID-V-003', sanitization_status: 'Đã sát trùng', current_status: 'Đang trong trại' }
];

export default function XeRaVao() {
  const { farmId } = useOutletContext<{ farmId: string }>();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      const mockData = generateMockVehicles();
      setVehicles(mockData);
      setLoading(false);
    };
    fetchVehicles();
  }, [farmId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center text-gray-700">
          <Truck className="mr-2 text-blue-600" />
          <h2 className="text-lg font-bold">Danh sách xe ra/vào</h2>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Tìm kiếm biển số..." className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center">
            <Plus size={18} className="mr-1" /> Thêm xe
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                <th className="p-4 font-semibold">Biển số xe</th>
                <th className="p-4 font-semibold">Loại xe</th>
                <th className="p-4 font-semibold">Tài xế</th>
                <th className="p-4 font-semibold">Thẻ RFID</th>
                <th className="p-4 font-semibold">Trạng thái sát trùng</th>
                <th className="p-4 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan={6} className="p-4 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : vehicles.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-gray-500">Không có dữ liệu</td></tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{v.plate_number}</td>
                    <td className="p-4 text-gray-600">{v.vehicle_type}</td>
                    <td className="p-4 text-gray-600">{v.driver_name} <br/><span className="text-xs text-gray-400">{v.driver_phone}</span></td>
                    <td className="p-4 text-gray-600">{v.rfid_tag}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        v.sanitization_status === 'Đã sát trùng' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {v.sanitization_status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{v.current_status}</td>
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
