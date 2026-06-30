import { useState } from 'react';
import { Briefcase, CheckCircle, Clock, PlayCircle, Shield, Wrench, Users } from 'lucide-react';

interface MockTask {
  id: string;
  title: string;
  location: string;
  time: string;
  status: 'pending' | 'in_progress' | 'completed';
}

const MOCK_ROLES = [
  { id: 'ky_thuat', name: 'Kỹ thuật', icon: <Wrench size={20} /> },
  { id: 'cong_nhan', name: 'Công nhân', icon: <Users size={20} /> },
  { id: 'bao_ve', name: 'Bảo vệ', icon: <Shield size={20} /> },
];

const MOCK_TASKS: Record<string, MockTask[]> = {
  ky_thuat: [
    { id: 't1', title: 'Kiểm tra hệ thống quạt thông gió', location: 'Chuồng nái đẻ 1', time: '08:00 - 09:30', status: 'completed' },
    { id: 't2', title: 'Bảo trì sensor nhiệt độ tự động', location: 'Chuồng bầu', time: '10:00 - 11:30', status: 'in_progress' },
    { id: 't3', title: 'Sửa đường ống nước tự động', location: 'Khu cách ly', time: '13:00 - 15:00', status: 'pending' },
    { id: 't4', title: 'Kiểm tra tín hiệu camera góc khuất', location: 'Toàn khu', time: '15:30 - 16:30', status: 'pending' },
  ],
  cong_nhan: [
    { id: 'c1', title: 'Vệ sinh hành lang nội bộ', location: 'Hành lang chính', time: '07:00 - 08:30', status: 'completed' },
    { id: 'c2', title: 'Khử trùng ủng và dụng cụ', location: 'Phòng thay đồ số 2', time: '09:00 - 10:00', status: 'completed' },
    { id: 'c3', title: 'Thu gom rác thải sinh hoạt', location: 'Khu sinh hoạt', time: '14:00 - 15:00', status: 'in_progress' },
    { id: 'c4', title: 'Bơm nước sạch bổ sung bồn phụ', location: 'Trạm bơm A', time: '16:00 - 17:00', status: 'pending' },
  ],
  bao_ve: [
    { id: 'b1', title: 'Tuần tra an ninh vành đai vòng ngoài', location: 'Vành đai 1', time: '06:00 - 08:00', status: 'completed' },
    { id: 'b2', title: 'Ghi nhận và kiểm tra xe cám vào', location: 'Cổng chính', time: '09:00 - 11:00', status: 'in_progress' },
    { id: 'b3', title: 'Giám sát nhân sự nhà thầu xây dựng', location: 'Khu công trình phụ', time: '13:00 - 16:00', status: 'pending' },
  ]
};

export default function CongViecDuocGiao() {
  const [activeRole, setActiveRole] = useState(MOCK_ROLES[0].id);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-linear-to-r from-emerald-600 to-teal-500 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Briefcase className="mr-3" size={28} />
            Công việc được giao (Mô phỏng Mobile)
          </h2>
          <p className="text-emerald-100 mt-1">Trang hiển thị ứng dụng cho các đối tượng nhân viên khác nhau</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-gray-200 dark:border-gray-700 pb-4 custom-scrollbar">
        {MOCK_ROLES.map(role => (
          <button
            key={role.id}
            onClick={() => setActiveRole(role.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap
              ${activeRole === role.id 
                ? 'bg-emerald-100 text-emerald-800 shadow-sm border border-emerald-200' 
                : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 border border-transparent'
              }`}
          >
            {role.icon}
            {role.name}
          </button>
        ))}
      </div>

      {/* Task List for Active Role */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center mb-4">
          <Clock className="mr-2 text-emerald-500" size={20} /> Danh sách công việc ({MOCK_ROLES.find(r => r.id === activeRole)?.name})
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          {MOCK_TASKS[activeRole]?.map(task => (
            <div key={task.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  task.status === 'completed' ? 'bg-green-100 text-green-700' :
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {task.status === 'completed' ? 'Đã hoàn thành' : task.status === 'in_progress' ? 'Đang làm' : 'Chưa thực hiện'}
                </span>
                {task.status === 'completed' && <CheckCircle className="text-green-500" size={20} />}
              </div>
              
              <h4 className="font-bold text-lg text-gray-800 dark:text-white mb-2">{task.title}</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <p className="flex justify-between"><span>📍 Khu vực:</span> <span className="font-medium text-gray-800 dark:text-gray-200">{task.location}</span></p>
                <p className="flex justify-between"><span>⏰ Khung giờ:</span> <span className="font-medium text-gray-800 dark:text-gray-200">{task.time}</span></p>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-2">
                {task.status === 'pending' && (
                  <button className="col-span-2 flex justify-center items-center py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium rounded-lg transition border border-emerald-200">
                    <PlayCircle size={18} className="mr-2" /> Bắt đầu việc
                  </button>
                )}
                {task.status === 'in_progress' && (
                  <>
                    <button className="flex justify-center items-center py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition shadow-sm">
                      Tạm dừng
                    </button>
                    <button className="flex justify-center items-center py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 font-medium rounded-lg transition shadow-md shadow-emerald-500/20">
                      Hoàn thành
                    </button>
                  </>
                )}
                {task.status === 'completed' && (
                  <button className="col-span-2 py-2.5 bg-gray-100 text-gray-400 font-medium rounded-lg cursor-not-allowed">
                    Đã hoàn tất
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
