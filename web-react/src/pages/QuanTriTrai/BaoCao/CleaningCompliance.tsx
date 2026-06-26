import { ActivitySquare, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function CleaningCompliance() {
  const tasks = [
    { barn: 'Chuồng Đẻ 1', status: 'Completed', time: '10:30', assigned: 'Nguyễn Văn A' },
    { barn: 'Chuồng Đẻ 2', status: 'Completed', time: '11:00', assigned: 'Trần Thị B' },
    { barn: 'Chuồng Bầu 1', status: 'Pending', time: '14:00', assigned: 'Lê Văn C' },
    { barn: 'Chuồng Đực 1', status: 'Pending', time: '15:30', assigned: 'Hoàng Văn D' },
    { barn: 'Khu Cách Ly', status: 'Overdue', time: '08:00', assigned: 'Phạm Thị E' },
    { barn: 'Nhà kho cám', status: 'Overdue', time: '09:15', assigned: 'Ngô Văn F' },
  ];

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    overdue: tasks.filter(t => t.status === 'Overdue').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <ActivitySquare />, label: 'Scheduled Tasks', value: stats.total, bg: 'bg-blue-50', color: 'text-blue-500' },
          { icon: <CheckCircle />, label: 'Completed', value: stats.completed, bg: 'bg-green-50', color: 'text-green-500' },
          { icon: <Clock />, label: 'Pending', value: stats.pending, bg: 'bg-yellow-50', color: 'text-yellow-500' },
          { icon: <AlertTriangle />, label: 'Overdue', value: stats.overdue, bg: 'bg-red-50', color: 'text-red-500' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className={`p-3 rounded-full ${stat.bg} ${stat.color} mr-4`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Today's Cleaning Schedule (Mock Data)</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
            <tr>
              <th className="p-4">Khu vực</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Người phụ trách</th>
              <th className="p-4">Thời gian</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {tasks.map((task, idx) => (
              <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-bold text-gray-700">{task.barn}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    task.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {task.status}
                  </span>
                </td>
                <td className="p-4 text-gray-600">{task.assigned}</td>
                <td className="p-4 text-gray-600">{task.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
