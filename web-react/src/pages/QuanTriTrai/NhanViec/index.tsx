import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import { 
  Briefcase, CheckCircle, Clock, PlayCircle, AlertTriangle, FileText, Upload, ChevronRight
} from 'lucide-react';

import PenCheckForm from '../PigletTransfer/PenCheckForm';
import HandoverForm from '../PigletTransfer/HandoverForm';
import ReceivingForm from '../PigletTransfer/ReceivingForm';

interface Employee {
  id: string;
  full_name: string;
  job_title: string;
}

interface Task {
  id: string;
  task_category: string;
  task_description: string;
  expected_start: string;
  expected_end: string;
  status: string;
  metadata?: any;
  farm_zones?: { zone_name: string };
  barns?: { barn_name: string };
  shower_rooms?: { room_name: string };
}

export default function NhanViec() {
  const { farmId } = useOutletContext<{ farmId: string }>();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [reportingTask, setReportingTask] = useState<Task | null>(null);

  // States for Piglet Transfer forms
  const [activeFormType, setActiveFormType] = useState<string | null>(null);
  const [activeFormTaskId, setActiveFormTaskId] = useState<string | null>(null);
  
  // Reference data for Piglet forms
  const [employeesRef, setEmployeesRef] = useState<any[]>([]);
  const [barnsRef, setBarnsRef] = useState<any[]>([]);
  const [farmsRef, setFarmsRef] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'all' | 'regular' | 'piglet'>('all');

  useEffect(() => {
    if (farmId) {
      fetchEmployees();
      fetchRefData();
    }
  }, [farmId]);

  useEffect(() => {
    if (selectedEmp) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [selectedEmp, date]);

  const fetchEmployees = async () => {
    const { data } = await supabase.from('employees').select('id, full_name, job_title').eq('farm_id', farmId);
    if (data) {
      setEmployees(data);
      if (data.length > 0) setSelectedEmp(data[0].id);
    }
  };

  const fetchRefData = async () => {
    const [eRes, bRes, fRes] = await Promise.all([
      supabase.from('employees').select('*').eq('farm_id', farmId),
      supabase.from('barns').select('*').eq('farm_id', farmId),
      supabase.from('farms').select('*')
    ]);
    if (eRes.data) setEmployeesRef(eRes.data);
    if (bRes.data) setBarnsRef(bRes.data);
    if (fRes.data) setFarmsRef(fRes.data);
  };

  const fetchTasks = async () => {
    const { data: plan } = await supabase.from('daily_work_plans').select('id').eq('farm_id', farmId).eq('plan_date', date).single();
    if (!plan) {
      setTasks([]);
      return;
    }

    const { data: assignedTasks } = await supabase
      .from('assigned_tasks')
      .select(`
        *,
        farm_zones (zone_name),
        barns (barn_name),
        shower_rooms (room_name)
      `)
      .eq('plan_id', plan.id)
      .eq('employee_id', selectedEmp);

    if (assignedTasks) setTasks(assignedTasks);
  };

  const updateTaskStatus = async (id: string, status: string) => {
    await supabase.from('assigned_tasks').update({ status }).eq('id', id);
    fetchTasks();
  };

  const submitReport = async () => {
    if (!reportingTask) return;
    await supabase.from('task_report_submissions').insert({
      task_id: reportingTask.id,
      submitted_by: selectedEmp,
      report_data: { note: "Demo Báo Cáo Hoàn Thành" },
      issue_flag: false
    });
    await updateTaskStatus(reportingTask.id, 'completed');
    setReportingTask(null);
    alert('Đã gửi báo cáo thành công!');
  };

  const isPigletTask = (category: string) => ['pen_check', 'handover', 'receiving'].includes(category);

  const openForm = (task: Task) => {
    setActiveFormTaskId(task.id);
    setActiveFormType(task.task_category);
    if (task.status === 'assigned') {
      updateTaskStatus(task.id, 'in_progress');
    }
  };

  const closeForm = () => {
    setActiveFormTaskId(null);
    setActiveFormType(null);
  };

  const handleFormSaved = async () => {
    if (activeFormTaskId) {
       await updateTaskStatus(activeFormTaskId, 'completed'); // Or we can track 'submitted' if needed
    }
    closeForm();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto min-h-screen pb-10">
      {/* Header Impersonation */}
      <div className="bg-blue-600 dark:bg-blue-900 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Briefcase className="mr-3" size={28} />
            Mobile App Nhận Việc
          </h2>
          <p className="text-blue-200 mt-1 text-sm">Đóng vai nhân sự để xem các công việc và quy trình được giao</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-blue-700/50 border border-blue-500 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-300"
          />
          <select 
            value={selectedEmp} 
            onChange={(e) => setSelectedEmp(e.target.value)}
            className="flex-1 sm:w-64 bg-blue-700/50 border border-blue-500 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-300"
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.full_name} - {emp.job_title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b dark:border-gray-700 pb-3 gap-3">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center">
            <Clock className="mr-2 text-gray-500" size={20} /> Việc của tôi hôm nay
          </h3>
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'all' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Tất cả
            </button>
            <button 
              onClick={() => setActiveTab('regular')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'regular' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Vệ sinh & Kỹ thuật
            </button>
            <button 
              onClick={() => setActiveTab('piglet')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'piglet' ? 'bg-indigo-600 shadow-sm text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Chuồng & Bàn giao
            </button>
          </div>
        </div>

        {tasks.filter(task => {
          const _isPT = isPigletTask(task.task_category);
          if (activeTab === 'regular') return !_isPT;
          if (activeTab === 'piglet') return _isPT;
          return true;
        }).length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 text-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 text-gray-500">
            Hôm nay bạn không có lịch làm việc nào trong danh mục này.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {tasks.filter(task => {
              const _isPT = isPigletTask(task.task_category);
              if (activeTab === 'regular') return !_isPT;
              if (activeTab === 'piglet') return _isPT;
              return true;
            }).map(task => {
              const _isPT = isPigletTask(task.task_category);
              const sourceFarm = task.metadata?.source_farm_id ? farmsRef.find(f => f.id === task.metadata.source_farm_id)?.name || 'N/A' : 'N/A';
              const destFarm = task.metadata?.dest_farm_id ? farmsRef.find(f => f.id === task.metadata.dest_farm_id)?.name || 'N/A' : 'N/A';
              
              return (
              <div key={task.id} className={`rounded-2xl border p-5 shadow-sm hover:shadow-md transition flex flex-col
                ${_isPT ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white border-gray-100'}
              `}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                    task.status === 'completed' ? 'bg-green-100 text-green-700' :
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {task.status === 'completed' ? 'Đã hoàn thành' : task.status === 'in_progress' ? 'Đang làm' : 'Chưa bắt đầu'}
                  </span>
                  {task.status === 'completed' && <CheckCircle className="text-green-500" size={20} />}
                </div>
                
                <h4 className={`font-bold text-lg mb-1 ${_isPT ? 'text-indigo-900' : 'text-gray-800'}`}>
                  {task.task_description}
                </h4>
                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-4">
                  <p>📍 Khu vực: <span className="font-medium text-gray-700 dark:text-gray-300">{task.barns?.barn_name || task.farm_zones?.zone_name || 'Toàn trại'}</span></p>
                  
                  {_isPT && task.metadata ? (
                    <div className="mt-2 p-3 bg-white rounded-xl border border-indigo-100 text-indigo-900 text-sm space-y-1.5 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-gray-500 text-xs">Trại xuất:</span>
                          <p className="font-semibold truncate" title={sourceFarm}>{sourceFarm}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Trại nhận:</span>
                          <p className="font-semibold truncate" title={destFarm}>{destFarm}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-indigo-50 mt-2">
                        <div>
                          <span className="text-gray-500 text-xs block">Dự kiến lúc:</span>
                          <span className="font-semibold text-indigo-700">{task.metadata.expected_time ? new Date(task.metadata.expected_time).toLocaleString('vi-VN', { hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit' }) : 'N/A'}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-500 text-xs block">Số lượng:</span>
                          <span className="font-semibold text-indigo-700">{task.metadata.expected_qty} con</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-1 mt-1">
                         <span className="text-gray-500 text-xs">Mức độ ưu tiên:</span>
                         <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Cao</span>
                      </div>
                    </div>
                  ) : (
                    <p>🚿 Bắt buộc tắm: <span className="font-medium text-gray-700 dark:text-gray-300">{task.shower_rooms?.room_name || 'Không yêu cầu'}</span></p>
                  )}
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2">
                  {_isPT ? (
                    <button 
                      onClick={() => openForm(task)}
                      className={`col-span-2 flex justify-center items-center py-2.5 font-medium rounded-lg transition ${
                        task.status === 'completed' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20'
                      }`}
                    >
                      <FileText size={18} className="mr-2" /> 
                      {task.status === 'completed' ? 'Xem lại Form' : 'Mở Form Thực hiện'}
                      <ChevronRight size={18} className="ml-1" />
                    </button>
                  ) : (
                    <>
                      {task.status === 'assigned' && (
                        <button 
                          onClick={() => updateTaskStatus(task.id, 'in_progress')}
                          className="col-span-2 flex justify-center items-center py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium rounded-lg transition"
                        >
                          <PlayCircle size={18} className="mr-2" /> Bắt đầu việc
                        </button>
                      )}
                      {task.status === 'in_progress' && (
                        <>
                          <button 
                            onClick={() => alert("Chức năng báo lỗi vi phạm thiết kế cho di động.")}
                            className="flex justify-center items-center py-2 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg transition"
                          >
                            <AlertTriangle size={18} className="mr-1" /> Sự cố
                          </button>
                          <button 
                            onClick={() => setReportingTask(task)}
                            className="flex justify-center items-center py-2 bg-green-50 text-green-700 hover:bg-green-100 font-medium rounded-lg transition"
                          >
                            <FileText size={18} className="mr-1" /> Báo cáo
                          </button>
                        </>
                      )}
                      {task.status === 'completed' && (
                        <button className="col-span-2 py-2 bg-gray-100 text-gray-400 font-medium rounded-lg cursor-not-allowed">
                          Đã hoàn tất báo cáo
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

      {/* Basic Reporting Modal */}
      {reportingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold mb-4">Báo cáo hoàn thành</h3>
            <div className="space-y-4 mb-6">
              <label className="block">
                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Ghi chú công việc</span>
                <textarea className="mt-1 w-full border dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700" rows={3} placeholder="Mô tả tóm tắt..."></textarea>
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="text-sm text-gray-500">Nhấn để chụp ảnh minh chứng</p>
                  </div>
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setReportingTask(null)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">Hủy</button>
              <button onClick={submitReport} className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium shadow-lg hover:bg-green-700">Nộp báo cáo</button>
            </div>
          </div>
        </div>
      )}

      {/* Forms from Piglet Transfer Module */}
      {activeFormType === 'pen_check' && (
        <PenCheckForm 
          penCheckId="new" 
          farmId={farmId}
          onClose={closeForm}
          onSave={handleFormSaved}
        />
      )}
      
      {activeFormType === 'handover' && (
        <HandoverForm 
          handoverId="new" 
          farmId={farmId}
          employees={employeesRef}
          onClose={closeForm}
          onSave={handleFormSaved}
        />
      )}
      
      {activeFormType === 'receiving' && (
        <ReceivingForm 
          receivingId="new" 
          farmId={farmId}
          employees={employeesRef}
          barns={barnsRef}
          onClose={closeForm}
          onSave={handleFormSaved}
        />
      )}
    </div>
  );
}
