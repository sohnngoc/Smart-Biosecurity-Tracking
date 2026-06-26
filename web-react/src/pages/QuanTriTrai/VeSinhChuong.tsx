import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { ActivitySquare, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function VeSinhChuong() {
  const { farmId } = useParams();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!farmId) return;

    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('cleaning_tasks')
        .select('*')
        .eq('farm_id', farmId)
        .order('scheduled_time', { ascending: false });

      if (error) {
        console.error('Error fetching cleaning tasks:', error);
      } else {
        setTasks(data || []);
      }
    };

    fetchTasks();

    const channel = supabase
      .channel('cleaning_tasks_ve_sinh')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cleaning_tasks', filter: `farm_id=eq.${farmId}` }, () => {
        fetchTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [farmId]);

  const markCompleted = async (id: string) => {
    const { error } = await supabase
      .from('cleaning_tasks')
      .update({ status: 'Completed', completed_time: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      console.error('Error completing task:', error);
    }
  };

  const createMockTask = async () => {
    if (!farmId) return;
    const { error } = await supabase
      .from('cleaning_tasks')
      .insert({
        farm_id: farmId,
        target_zone: 'Chuồng Đẻ 2',
        task_name: 'Xịt rửa và phun thuốc sát trùng',
        assigned_to: 'Công nhân A',
        scheduled_time: new Date().toISOString(),
        status: 'Pending'
      });
    if (error) console.error('Error creating mock task:', error);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <ActivitySquare className="mr-3 text-blue-600" />
          Quản lý vệ sinh chuồng trại
        </h1>
        <button onClick={createMockTask} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm">
          + Thêm lịch vệ sinh (Mock)
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
            <tr>
              <th className="p-4">Khu vực</th>
              <th className="p-4">Công việc</th>
              <th className="p-4">Người phụ trách</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {tasks.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">Chưa có lịch vệ sinh nào.</td></tr>
            ) : tasks.map((task, idx) => (
              <tr key={task.id || idx} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-bold text-gray-700">{task.target_zone}</td>
                <td className="p-4 text-gray-600">{task.task_name}</td>
                <td className="p-4 text-gray-600">{task.assigned_to || '-'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold flex inline-flex items-center w-fit ${
                    task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    task.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {task.status === 'Completed' && <CheckCircle size={12} className="mr-1"/>}
                    {task.status === 'Overdue' && <AlertTriangle size={12} className="mr-1"/>}
                    {task.status === 'Pending' && <Clock size={12} className="mr-1"/>}
                    {task.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {task.status !== 'Completed' && (
                    <button onClick={() => markCompleted(task.id)} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      Đánh dấu hoàn thành
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
