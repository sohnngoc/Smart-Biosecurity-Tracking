import { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, Clock, PlayCircle, Shield, Wrench, Users, Camera, X, Upload, PauseCircle } from 'lucide-react';

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

const INITIAL_MOCK_TASKS: Record<string, MockTask[]> = {
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
  const [tasks, setTasks] = useState(INITIAL_MOCK_TASKS);
  
  // Timers and running state
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  
  // Completion Modal
  const [completingTask, setCompletingTask] = useState<MockTask | null>(null);

  useEffect(() => {
    let interval: any;
    if (runningTaskId) {
      interval = setInterval(() => {
        setTimers(prev => ({
          ...prev,
          [runningTaskId]: (prev[runningTaskId] || 0) + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [runningTaskId]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStart = (taskId: string) => {
    setTasks(prev => ({
      ...prev,
      [activeRole]: prev[activeRole].map(t => t.id === taskId ? { ...t, status: 'in_progress' } : t)
    }));
    setRunningTaskId(taskId);
  };

  const handlePause = () => {
    setRunningTaskId(null);
  };

  const handleCompleteClick = (task: MockTask) => {
    setRunningTaskId(null); // pause timer
    setCompletingTask(task);
  };

  const submitCompletion = () => {
    if (completingTask) {
      setTasks(prev => ({
        ...prev,
        [activeRole]: prev[activeRole].map(t => t.id === completingTask.id ? { ...t, status: 'completed' } : t)
      }));
      setCompletingTask(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto relative">
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
            onClick={() => {
              setActiveRole(role.id);
              setRunningTaskId(null); // pause any running task when switching tabs
            }}
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
          {tasks[activeRole]?.map(task => (
            <div key={task.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${
                  task.status === 'completed' ? 'bg-green-100 text-green-700' :
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {task.status === 'completed' ? 'Đã hoàn thành' : task.status === 'in_progress' ? 'Đang làm' : 'Chưa thực hiện'}
                  {task.status === 'in_progress' && runningTaskId === task.id && (
                    <span className="ml-1 px-1.5 py-0.5 bg-blue-200 text-blue-800 rounded text-[10px]">
                      {formatTime(timers[task.id] || 0)}
                    </span>
                  )}
                  {task.status === 'in_progress' && runningTaskId !== task.id && (timers[task.id] > 0) && (
                    <span className="ml-1 px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded text-[10px]">
                      {formatTime(timers[task.id])}
                    </span>
                  )}
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
                  <button onClick={() => handleStart(task.id)} className="col-span-2 flex justify-center items-center py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium rounded-lg transition border border-emerald-200">
                    <PlayCircle size={18} className="mr-2" /> Bắt đầu việc
                  </button>
                )}
                {task.status === 'in_progress' && (
                  <>
                    {runningTaskId === task.id ? (
                      <button onClick={handlePause} className="flex justify-center items-center py-2.5 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 font-medium rounded-lg transition shadow-sm">
                        <PauseCircle size={18} className="mr-2" /> Tạm dừng
                      </button>
                    ) : (
                      <button onClick={() => handleStart(task.id)} className="flex justify-center items-center py-2.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-medium rounded-lg transition shadow-sm">
                        <PlayCircle size={18} className="mr-2" /> Tiếp tục
                      </button>
                    )}
                    <button onClick={() => handleCompleteClick(task)} className="flex justify-center items-center py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 font-medium rounded-lg transition shadow-md shadow-emerald-500/20">
                      <CheckCircle size={18} className="mr-2" /> Hoàn thành
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

      {/* Completion Modal */}
      {completingTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl scale-in-95 duration-200">
            <div className="bg-emerald-600 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center"><CheckCircle className="mr-2" /> Đánh giá hoàn thành</h3>
              <button onClick={() => setCompletingTask(null)} className="text-emerald-100 hover:text-white transition">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Công việc:</p>
                <p className="font-bold text-gray-800 dark:text-white">{completingTask.title}</p>
                <p className="text-sm text-emerald-600 font-medium mt-1">Thời gian thực hiện: {formatTime(timers[completingTask.id] || 0)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ghi chú / Đánh giá kết quả</label>
                <textarea 
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-gray-50 dark:bg-gray-700/50 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  rows={3}
                  placeholder="Ví dụ: Đã kiểm tra xong, mọi thứ bình thường..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Đính kèm hình ảnh minh chứng</label>
                <div className="flex gap-3">
                  <button className="flex-1 flex flex-col items-center justify-center gap-2 py-4 bg-gray-50 dark:bg-gray-700/50 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-500">
                    <Camera size={24} />
                    <span className="text-sm font-medium">Chụp ảnh</span>
                  </button>
                  <button className="flex-1 flex flex-col items-center justify-center gap-2 py-4 bg-gray-50 dark:bg-gray-700/50 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-500">
                    <Upload size={24} />
                    <span className="text-sm font-medium">Tải lên</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/30 flex gap-3 border-t border-gray-100 dark:border-gray-700">
              <button 
                onClick={() => setCompletingTask(null)}
                className="flex-1 py-2.5 font-medium text-gray-600 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button 
                onClick={submitCompletion}
                className="flex-1 py-2.5 font-medium text-white bg-emerald-600 rounded-xl shadow-md hover:bg-emerald-700 transition"
              >
                Xác nhận xong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
