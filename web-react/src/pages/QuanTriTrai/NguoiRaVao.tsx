import { useEffect, useState } from 'react';
import { useParams , useOutletContext} from 'react-router-dom';
import { Users, Search, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export const generateMockPersons = () => {
  const list = [];
  // 3 Kỹ sư sinh hoạt
  for(let i=1; i<=3; i++) {
    list.push({ id: `sh_ks_${i}`, full_name: `Nguyễn Văn Kỹ Sư ${i}`, person_code: `KS-SH-0${i}`, department: 'Kỹ thuật', person_role: 'Kỹ sư', rfid_card: `RFID-KS-${100+i}`, shower_status: 'Đã tắm sát trùng', current_status: 'Đang nghỉ ngơi', location: 'Khu sinh hoạt' });
  }
  // 20 Công nhân sinh hoạt
  for(let i=1; i<=20; i++) {
    list.push({ id: `sh_cn_${i}`, full_name: `Trần Thị Công Nhân ${i}`, person_code: `CN-SH-${i<10?'0'+i:i}`, department: 'Chăn nuôi', person_role: 'Công nhân', rfid_card: `RFID-CN-${200+i}`, shower_status: 'Đã tắm sát trùng', current_status: 'Đang nghỉ ngơi', location: 'Khu sinh hoạt' });
  }
  // 1 Kỹ sư cách ly
  list.push({ id: `cl_ks_1`, full_name: `Lê Văn Kỹ Sư Cách Ly`, person_code: `KS-CL-01`, department: 'Kỹ thuật', person_role: 'Kỹ sư', rfid_card: `RFID-KS-104`, shower_status: 'Chưa tắm sát trùng', current_status: 'Đang cách ly (Còn 15h)', location: 'Khu cách ly' });
  // 5 Công nhân cách ly
  for(let i=1; i<=5; i++) {
    list.push({ id: `cl_cn_${i}`, full_name: `Phạm Văn Công Nhân ${i}`, person_code: `CN-CL-0${i}`, department: 'Chăn nuôi', person_role: 'Công nhân', rfid_card: `RFID-CN-${300+i}`, shower_status: 'Chưa tắm sát trùng', current_status: 'Đang cách ly (Còn 24h)', location: 'Khu cách ly' });
  }
  return list;
};

export default function NguoiRaVao() {
  const { farmId } = useOutletContext<{ farmId: string }>();
  const [persons, setPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: ReturnType<typeof supabase.channel>;

    const fetchPersons = async () => {
      setLoading(true);
      // Kiểm tra có cảnh báo S2 không
      let hasAlertS2 = false;
      if (farmId) {
        const { data } = await supabase
          .from('alerts')
          .select('alert_code')
          .eq('farm_id', farmId)
          .eq('status', 'Chưa xử lý')
          .like('alert_code', '%-S2-%');
        
        hasAlertS2 = (data && data.length > 0) || false;
      }

      // Sử dụng dữ liệu giả lập
      const mockData = generateMockPersons();
      
      // Nếu có vi phạm S2, đẩy người vi phạm lên đầu
      if (hasAlertS2) {
        mockData.unshift({
           id: 'violator_1',
           full_name: 'Lê Trường Sơn (Vi phạm)',
           person_code: 'KS-DE-02',
           department: 'Kỹ thuật',
           person_role: 'Kỹ sư trại',
           rfid_card: 'RFID-KS-109',
           shower_status: 'Chưa tắm sát trùng',
           current_status: 'CẢNH BÁO: Xâm nhập trái phép',
           location: 'Trước Chuồng Đẻ 1'
        });
      }
      
      setPersons(mockData);
      setLoading(false);
    };
    
    fetchPersons();

    // Lắng nghe realtime các thay đổi của bảng alerts
    if (farmId) {
      subscription = supabase
        .channel(`public:alerts_persons`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'alerts', filter: `farm_id=eq.${farmId}` },
          () => fetchPersons()
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
          <Users className="mr-2 text-blue-600" />
          <h2 className="text-lg font-bold">Danh sách người ra/vào</h2>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Tìm kiếm tên..." className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center">
            <Plus size={18} className="mr-1" /> Thêm nhân sự
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                <th className="p-4 font-semibold">Họ Tên</th>
                <th className="p-4 font-semibold">Bộ phận</th>
                <th className="p-4 font-semibold">Vai trò</th>
                <th className="p-4 font-semibold">Thẻ RFID</th>
                <th className="p-4 font-semibold">Vị trí hiện tại</th>
                <th className="p-4 font-semibold">Trạng thái tắm</th>
                <th className="p-4 font-semibold">Hoạt động</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan={6} className="p-4 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : persons.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-gray-500">Không có dữ liệu</td></tr>
              ) : (
                persons.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{p.full_name}<br/><span className="text-xs text-gray-400">{p.person_code}</span></td>
                    <td className="p-4 text-gray-600">{p.department}</td>
                    <td className="p-4 text-gray-600">{p.person_role}</td>
                    <td className="p-4 text-gray-600">{p.rfid_card}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.location === 'Trước Chuồng Đẻ 1' ? 'bg-red-100 text-red-700 font-bold' :
                        p.location === 'Khu sinh hoạt' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {p.location}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.shower_status === 'Đã tắm sát trùng' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 font-bold'
                      }`}>
                        {p.shower_status}
                      </span>
                    </td>
                    <td className={`p-4 font-medium ${p.current_status.includes('CẢNH BÁO') ? 'text-red-600 animate-pulse' : 'text-gray-600'}`}>
                      {p.current_status}
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
