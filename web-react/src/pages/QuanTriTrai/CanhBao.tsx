import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useParams , useOutletContext} from 'react-router-dom';
import { ShieldAlert, Filter, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function CanhBao() {
  const { farmId } = useOutletContext<{ farmId: string }>();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    if (!farmId) return;
    const { data } = await supabase.from('alerts').select('*').eq('farm_id', farmId).order('created_at', { ascending: false });
    if (data) setAlerts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();

    const channel = supabase.channel('alerts_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts', filter: `farm_id=eq.${farmId}` }, () => {
        fetchAlerts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [farmId]);

  const handleResolve = async (id: string, severity: string) => {
    // Cập nhật state local để UI phản hồi tức thì
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Đã xử lý' } : a));
    
    // Cập nhật trạng thái trong CSDL
    const { error } = await supabase
      .from('alerts')
      .update({ status: 'Đã xử lý' })
      .eq('id', id);
      
    if (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      // Hoàn tác nếu lỗi
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Chưa xử lý' } : a));
    } else {
      // Tính điểm rủi ro cần giảm
      let scoreReduction = 10;
      if (severity === 'Nghiêm trọng') scoreReduction = 30;
      else if (severity === 'Cao') scoreReduction = 20;

      if (farmId) {
        try {
          const { data: farm } = await supabase.from('farms').select('active_alert_count, risk_score').eq('id', farmId).single();
          if (farm) {
            let newScore = (farm.risk_score || 0) - scoreReduction;
            if (newScore < 0) newScore = 0;

            await supabase.from('farms').update({ 
              active_alert_count: farm.active_alert_count > 0 ? farm.active_alert_count - 1 : 0,
              risk_score: newScore
            }).eq('id', farmId);
          }
        } catch (e) {
          console.warn('Không thể cập nhật farms.risk_score trên DB, có thể do thiếu cột.', e);
        }
      }
      
      // Đồng bộ tắt IoT Zone khi xử lý cảnh báo
      localStorage.removeItem('iot_selected_zone');
      window.dispatchEvent(new Event('iot_zone_changed'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center text-gray-700">
          <ShieldAlert className="mr-2 text-red-600" />
          <h2 className="text-lg font-bold">Quản lý cảnh báo</h2>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center">
            <Filter size={18} className="mr-1" /> Lọc dữ liệu
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                <th className="p-4 font-semibold">Mã</th>
                <th className="p-4 font-semibold">Thời gian</th>
                <th className="p-4 font-semibold">Loại vi phạm</th>
                <th className="p-4 font-semibold">Mức độ</th>
                <th className="p-4 font-semibold">Nội dung chi tiết</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan={7} className="p-4 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : alerts.length === 0 ? (
                <tr><td colSpan={7} className="p-4 text-center text-gray-500">Không có dữ liệu cảnh báo</td></tr>
              ) : (
                alerts.map((a) => (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{a.alert_code}</td>
                    <td className="p-4 text-gray-600">{format(new Date(a.created_at), 'dd/MM/yyyy HH:mm')}</td>
                    <td className="p-4 text-gray-600">{a.alert_type}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        a.severity === 'Nghiêm trọng' ? 'bg-red-600 text-white' : 
                        a.severity === 'Cao' ? 'bg-red-100 text-red-700' :
                        a.severity === 'Trung bình' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {a.severity}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 max-w-xs">
                      <div className="font-medium truncate mb-1" title={a.message}>{a.message}</div>
                      {a.recommended_action && (
                        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded truncate" title={a.recommended_action}>
                          Hành động: {a.recommended_action}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        a.status === 'Chưa xử lý' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {a.status === 'Chưa xử lý' && (
                        <button 
                          onClick={() => handleResolve(a.id, a.severity)}
                          className="text-green-600 hover:text-green-800 flex items-center justify-center w-full transition-transform hover:scale-110" 
                          title="Xác nhận đã xử lý"
                        >
                          <CheckCircle size={18} />
                        </button>
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
