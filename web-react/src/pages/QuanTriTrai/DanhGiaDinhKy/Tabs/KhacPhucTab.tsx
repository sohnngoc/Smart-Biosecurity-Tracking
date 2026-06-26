import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';

export default function KhacPhucTab({ farmId }: { farmId: string | undefined }) {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActions = async () => {
      if (!farmId) return;
      // Fetch answers that have corrective_action
      const { data } = await supabase
        .from('farm_assessment_answers')
        .select(`
          id, corrective_action, action_status, action_owner, due_date, notes,
          assessment_criteria(criteria_name),
          farm_assessment_sessions!inner(farm_id, assessment_date)
        `)
        .eq('farm_assessment_sessions.farm_id', farmId)
        .not('corrective_action', 'is', null)
        .neq('corrective_action', '')
        .order('created_at', { ascending: false });
      
      if (data) setActions(data);
      setLoading(false);
    };

    fetchActions();
  }, [farmId]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('farm_assessment_answers').update({ action_status: status }).eq('id', id);
    if (!error) {
      setActions(prev => prev.map(a => a.id === id ? { ...a, action_status: status } : a));
    }
  };

  if (loading) return <div>Đang tải hành động khắc phục...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Theo dõi Hành động khắc phục</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {actions.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            Không có hành động khắc phục nào.
          </div>
        ) : (
          actions.map((a) => (
            <div key={a.id} className="bg-white p-4 border rounded-xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:border-blue-300 transition-colors">
              <div className="flex-1">
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <span className="font-semibold text-gray-700 mr-2">{a.assessment_criteria?.criteria_name}</span>
                  • {a.farm_assessment_sessions?.assessment_date}
                </div>
                <p className="text-gray-900 font-medium">{a.corrective_action}</p>
                {a.notes && <p className="text-sm text-gray-500 mt-1 italic">Ghi chú: {a.notes}</p>}
                <div className="flex items-center mt-3 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium mr-1">Người phụ trách:</span> {a.action_owner || 'Chưa chỉ định'}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium mr-1">Hạn chót:</span> {a.due_date || 'Không có'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 min-w-[140px]">
                <select
                  value={a.action_status}
                  onChange={(e) => updateStatus(a.id, e.target.value)}
                  className={`p-2 rounded-lg border text-sm font-medium outline-none ${
                    a.action_status === 'done' ? 'bg-green-50 text-green-700 border-green-200' :
                    a.action_status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    a.action_status === 'overdue' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-orange-50 text-orange-700 border-orange-200'
                  }`}
                >
                  <option value="open">Đang mở (Open)</option>
                  <option value="in_progress">Đang xử lý</option>
                  <option value="done">Hoàn thành</option>
                  <option value="overdue">Quá hạn</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
