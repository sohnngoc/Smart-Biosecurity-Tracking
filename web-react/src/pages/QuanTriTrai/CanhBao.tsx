import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useOutletContext } from 'react-router-dom';
import { ShieldAlert, CheckCircle, AlertTriangle, Info, Shield, Search } from 'lucide-react';
import { format } from 'date-fns';

interface Alert {
  id: string;
  created_at: string;
  alert_type: string;
  severity: string;
  description: string;
  status: string;
  employees: { full_name: string; employee_code: string };
  checkpoints: { checkpoint_name: string };
}

export default function CanhBao() {
  const { farmId } = useOutletContext<{ farmId: string }>();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open'); // open, all, resolved

  const fetchAlerts = async () => {
    if (!farmId) return;
    let query = supabase
      .from('biosecurity_alerts')
      .select(`
        id, created_at, alert_type, severity, description, status,
        employees (full_name, employee_code),
        checkpoints (checkpoint_name)
      `)
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false });
      
    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;
    if (data) setAlerts(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();
    const channel = supabase.channel('biosecurity_alerts_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'biosecurity_alerts', filter: `farm_id=eq.${farmId}` }, () => {
        fetchAlerts();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [farmId, filter]);

  const resolveAlert = async (id: string) => {
    await supabase.from('biosecurity_alerts').update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq('id', id);
    fetchAlerts();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <ShieldAlert className="mr-3 text-red-600 dark:text-red-400" size={28} />
            Cảnh báo An toàn sinh học
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Quản lý các vi phạm và rủi ro lây nhiễm từ hệ thống Finger Scan</p>
        </div>
        <div className="flex space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
          <button onClick={() => setFilter('open')} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'open' ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Cần xử lý</button>
          <button onClick={() => setFilter('resolved')} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'resolved' ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Đã xử lý</button>
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'all' ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Tất cả</button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải cảnh báo...</div>
        ) : alerts.length === 0 ? (
          <div className="bg-green-50 dark:bg-green-900/20 p-8 text-center rounded-2xl border border-green-200 dark:border-green-800 flex flex-col items-center">
            <Shield className="text-green-500 mb-3" size={48} />
            <h3 className="text-lg font-bold text-green-700 dark:text-green-400 mb-1">Tuyệt vời! Hệ thống an toàn</h3>
            <p className="text-green-600 dark:text-green-500">Không có cảnh báo nào trong trạng thái này.</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className={`p-5 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:shadow-md ${
              alert.status === 'resolved' ? 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700' :
              alert.severity === 'critical' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/50' : 
              alert.severity === 'high' ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/50' : 
              'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/50'
            }`}>
              <div className="flex items-start">
                <div className={`p-3 rounded-full mr-4 hidden sm:block ${
                  alert.status === 'resolved' ? 'bg-gray-200 text-gray-500 dark:bg-gray-700' :
                  alert.severity === 'critical' ? 'bg-red-200 text-red-600' : 
                  alert.severity === 'high' ? 'bg-orange-200 text-orange-600' : 'bg-yellow-200 text-yellow-600'
                }`}>
                  {alert.status === 'resolved' ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                       alert.status === 'resolved' ? 'bg-gray-200 text-gray-600' :
                       alert.severity === 'critical' ? 'bg-red-600 text-white' : 
                       alert.severity === 'high' ? 'bg-orange-500 text-white' : 'bg-yellow-500 text-white'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-sm font-medium text-gray-500">
                      {format(new Date(alert.created_at), 'dd/MM/yyyy HH:mm:ss')}
                    </span>
                  </div>
                  <h3 className={`font-bold text-lg mb-1 ${alert.status === 'resolved' ? 'text-gray-600 dark:text-gray-400 line-through' : 'text-gray-800 dark:text-white'}`}>
                    {alert.description}
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                    {alert.employees && <span>👤 Nhân sự: <span className="font-medium">{alert.employees.full_name}</span></span>}
                    {alert.checkpoints && <span>📍 Vị trí: <span className="font-medium">{alert.checkpoints.checkpoint_name}</span></span>}
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-auto flex justify-end">
                {alert.status === 'open' ? (
                  <button onClick={() => resolveAlert(alert.id)} className="w-full sm:w-auto flex justify-center items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-200 transition">
                    <CheckCircle size={18} className="mr-2 text-green-500" /> Đánh dấu đã xử lý
                  </button>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-sm font-medium flex items-center">
                    <CheckCircle size={16} className="mr-1" /> Đã xử lý
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
