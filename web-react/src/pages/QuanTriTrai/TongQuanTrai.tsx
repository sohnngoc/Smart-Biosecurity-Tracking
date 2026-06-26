import { useOutletContext} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { ShieldAlert, Truck, Users, WifiOff, ArrowRight, BellRing, ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateMockPersons } from './NguoiRaVao';
import { generateMockVehicles } from './XeRaVao';
import { getApprovedVisitLogsByFarm, visitSessionMap, swabResultMap } from '../../lib/visitRequestLogic';
import type { FarmVisitRequest } from '../../lib/visitRequestLogic';

export default function TongQuanTrai() {
  const { farmId } = useOutletContext<{ farmId: string }>();
  const navigate = useNavigate();
  const [farmData, setFarmData] = useState<any>(null);
  const [assessmentSummary, setAssessmentSummary] = useState<any>(null);
  const [visitLogs, setVisitLogs] = useState<FarmVisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [iotZone, setIotZone] = useState(localStorage.getItem('iot_selected_zone') || '');

  useEffect(() => {
    const handleZoneChange = () => {
      setIotZone(localStorage.getItem('iot_selected_zone') || '');
    };
    window.addEventListener('iot_zone_changed', handleZoneChange);
    window.addEventListener('storage', handleZoneChange);
    return () => {
      window.removeEventListener('iot_zone_changed', handleZoneChange);
      window.removeEventListener('storage', handleZoneChange);
    };
  }, []);

  const fetchDashboard = async () => {
    if (!farmId) return;
    const { data } = await supabase.from('farms').select('*').eq('id', farmId).single();
    if (data) setFarmData(data);

    const { data: summary } = await supabase.from('farm_assessment_dashboard_summary').select('*').eq('farm_id', farmId).single();
    if (summary) setAssessmentSummary(summary);

    try {
      const logs = await getApprovedVisitLogsByFarm(farmId);
      setVisitLogs(logs as any);
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
    
    // Đăng ký realtime
    const channel = supabase.channel('farm_updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'farms', filter: `id=eq.${farmId}` }, (payload) => {
        setFarmData(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [farmId]);

  if (loading) return <div className="text-gray-500">Đang tải dữ liệu...</div>;
  if (!farmData) return <div className="text-red-500">Lỗi: Không tìm thấy dữ liệu trại.</div>;

  return (
    <div className="space-y-6">
      {assessmentSummary?.mandatory_failed_count > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center shadow-sm animate-pulse-slow">
          <ShieldAlert className="text-red-600 mr-3" size={28} />
          <div>
            <h4 className="font-bold text-red-900">CẢNH BÁO AN TOÀN SINH HỌC NGHIÊM TRỌNG</h4>
            <p className="text-sm text-red-700 mt-0.5">Phát hiện <strong>{assessmentSummary.mandatory_failed_count}</strong> tiêu chí ATSH bắt buộc <span className="font-bold uppercase">Không đạt</span> trong kỳ đánh giá gần nhất. Yêu cầu xử lý ngay lập tức.</p>
          </div>
        </div>
      )}

      {iotZone && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg flex items-center justify-between shadow-sm">
          <div className="flex items-center">
            <BellRing className="animate-bounce mr-3 text-blue-600" size={20} />
            <span>
              Hệ thống đang chạy <strong>Mô phỏng IoT</strong> tại khu vực: <span className="uppercase font-bold text-blue-700">{iotZone}</span>
            </span>
          </div>
          <button 
            onClick={() => navigate(`/trai/${farmId}/ban-do-noi-bo`)}
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 font-medium transition"
          >
            Xem Bản Đồ 3D
          </button>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600 mr-4">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Xe đang trong trại</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {generateMockVehicles().filter(v => v.current_status === 'Đang trong trại').length}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center">
          <div className="bg-green-100 p-3 rounded-lg text-green-600 mr-4">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Người trong khu sạch</p>
            <h3 className="text-2xl font-bold text-gray-900">{generateMockPersons().length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-red-200 flex items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
          <div className="bg-red-100 p-3 rounded-lg text-red-600 mr-4">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Cảnh báo chưa xử lý</p>
            <h3 className="text-2xl font-bold text-red-600">{farmData.active_alert_count}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center">
          <div className="bg-orange-100 p-3 rounded-lg text-orange-600 mr-4">
            <WifiOff size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Thiết bị mất tín hiệu</p>
            <h3 className="text-2xl font-bold text-gray-900">{farmData.lost_device_count}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center cursor-pointer hover:border-blue-300" onClick={() => navigate(`/trai/${farmId}/danh-gia-dinh-ky`)}>
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600 mr-4">
            <ClipboardCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Điểm ATSH Định kỳ</p>
            <h3 className="text-2xl font-bold text-gray-900">{assessmentSummary?.overall_assessment_score || 0}%</h3>
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Điểm Đánh Giá An Toàn Sinh Học</h3>
          <div className="flex items-center justify-center py-8">
            <div className={`w-40 h-40 rounded-full border-8 flex items-center justify-center flex-col transition-colors duration-500 ${
              farmData.risk_score > 90 ? 'border-green-500' :
              farmData.risk_score >= 80 ? 'border-yellow-400' :
              farmData.risk_score >= 70 ? 'border-orange-500' : 'border-red-600'
            }`}>
              <span className={`text-4xl font-black transition-colors duration-500 ${
                farmData.risk_score > 90 ? 'text-green-600' :
                farmData.risk_score >= 80 ? 'text-yellow-600' :
                farmData.risk_score >= 70 ? 'text-orange-600' : 'text-red-700'
              }`}>{farmData.risk_score}</span>
              <span className="text-sm text-gray-500 mt-1">/ 100</span>
            </div>
            <div className="ml-8 flex flex-col justify-center space-y-3">
              <div className="flex items-center">
                <span className="w-4 h-4 rounded bg-green-500 mr-2"></span>
                <span className="text-sm text-gray-600">An toàn (&gt;90)</span>
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 rounded bg-yellow-400 mr-2"></span>
                <span className="text-sm text-gray-600">Cần chú ý (80-90)</span>
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 rounded bg-orange-500 mr-2"></span>
                <span className="text-sm text-gray-600">Rủi ro (70-79)</span>
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 rounded bg-red-600 mr-2"></span>
                <span className="text-sm text-gray-600">Rủi ro cao (&lt;70)</span>
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500">
            {assessmentSummary?.overall_assessment_score > 0 
              ? `Điểm đánh giá ATSH đồng bộ từ kỳ đánh giá gần nhất (${assessmentSummary.overall_assessment_score}%)`
              : 'Đánh giá rủi ro dựa trên dữ liệu vệ sinh, tần suất ra vào và cảnh báo vi phạm.'}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Mô Phỏng Rủi Ro ATSH (Simulation)</h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Truy cập module Mô Phỏng Rủi Ro để kích hoạt 5 kịch bản rủi ro điển hình. Hệ thống sẽ tự động sinh dữ liệu cảnh báo, nhấp nháy trên bản đồ nội bộ và tính toán lại điểm rủi ro.
            </p>
          </div>
          <button 
            onClick={() => navigate(`/trai/${farmId}/mo-phong-rui-ro`)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition font-medium text-sm flex items-center justify-center shadow-sm"
          >
            Chạy Kịch Bản Mô Phỏng
            <ArrowRight size={18} className="ml-2" />
          </button>
        </div>
      </div>

      {/* Log Đăng ký vào trại */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mt-6">
        <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Log Đăng Ký Vào Trại Đã Duyệt (Sắp tới & 7 ngày qua)</h3>
        {visitLogs.filter(log => log.swab_result === 'positive').length > 0 && (
          <div className="mb-4 bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
            <div className="flex items-center text-red-800 font-bold mb-1">
              <ShieldAlert className="mr-2" size={18} /> Cảnh báo: Có người sắp vào trại có kết quả xét nghiệm Dương tính!
            </div>
            <p className="text-sm text-red-700">Yêu cầu kiểm tra ngay danh sách bên dưới và hủy quyết định duyệt đối với các trường hợp Dương tính.</p>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dự kiến vào</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buổi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người vào</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bộ phận</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Biển số xe</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mục đích</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Swab</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visitLogs.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-4 text-center text-gray-500 text-sm">Chưa có dữ liệu người vào trại</td></tr>
              ) : (
                visitLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{new Date(log.estimated_visit_date).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{visitSessionMap[log.visit_session]}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{log.requester_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{log.department}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{log.vehicle_plate_number || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{log.visit_purpose}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {!log.swab_available ? <span className="text-xs text-gray-400">Không có</span> : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.swab_result === 'negative' ? 'bg-green-100 text-green-800' :
                          log.swab_result === 'positive' ? 'bg-red-100 text-red-800 animate-pulse' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {swabResultMap[log.swab_result || '']}
                        </span>
                      )}
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
