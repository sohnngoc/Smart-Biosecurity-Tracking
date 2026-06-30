import { useState } from 'react';
import { Users, Search, Plus, Trash2, Shield, Calendar, Phone, Mail, UserCircle, Briefcase, X, FileCheck, UserPlus } from 'lucide-react';

interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  job_title: string;
  department: string;
  role: string;
  status: 'active' | 'resigned';
  join_date: string;
  resign_date: string | null;
  phone: string;
  email: string;
  avatar: string;
}

const mockEmployees: Employee[] = [
  { id: 'emp-001', employee_code: 'NS-001', full_name: 'Nguyễn Văn A', job_title: 'Kỹ thuật viên trưởng', department: 'Kỹ thuật', role: 'admin', status: 'active', join_date: '2023-01-15', resign_date: null, phone: '0901234567', email: 'vana@biosecurity.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
  { id: 'emp-002', employee_code: 'NS-002', full_name: 'Trần Thị B', job_title: 'Công nhân vệ sinh', department: 'Vệ sinh', role: 'worker', status: 'active', join_date: '2023-03-20', resign_date: null, phone: '0901234568', email: 'thib@biosecurity.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { id: 'emp-003', employee_code: 'NS-003', full_name: 'Lê Văn C', job_title: 'Bảo vệ', department: 'An ninh', role: 'guard', status: 'resigned', join_date: '2022-11-10', resign_date: '2024-05-15', phone: '0901234569', email: 'vanc@biosecurity.com', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d' },
  { id: 'emp-004', employee_code: 'NS-004', full_name: 'Phạm Thị D', job_title: 'Quản lý trại', department: 'Ban Giám Đốc', role: 'manager', status: 'active', join_date: '2021-06-01', resign_date: null, phone: '0901234570', email: 'thid@biosecurity.com', avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d' },
];

export default function NhanSu() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const filteredEmployees = employees.filter(e => 
    e.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.job_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xoá nhân sự này không? Hành động này không thể hoàn tác.')) {
      setEmployees(employees.filter(emp => emp.id !== id));
      if (selectedEmployee?.id === id) setSelectedEmployee(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
            <Users className="mr-3 text-emerald-600 dark:text-emerald-400" size={28} />
            Quản trị nhân sự trại
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Quản lý hồ sơ, phân quyền và trạng thái làm việc</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Tìm nhân sự, mã NV..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white transition-all"
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-emerald-500/30 whitespace-nowrap"
          >
            <Plus size={20} className="sm:mr-2" />
            <span className="hidden sm:inline">Thêm nhân sự</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Employee List */}
        <div className={`w-full ${selectedEmployee || isAdding ? 'lg:w-1/3 xl:w-2/5 hidden lg:block' : ''}`}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-[calc(100vh-14rem)]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center">
                <Briefcase className="mr-2 text-emerald-500" size={18} />
                Danh sách nhân sự ({filteredEmployees.length})
              </h3>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
              {filteredEmployees.map(emp => (
                <div 
                  key={emp.id}
                  onClick={() => { setSelectedEmployee(emp); setIsAdding(false); }}
                  className={`flex items-center p-3 rounded-xl cursor-pointer transition-all border ${selectedEmployee?.id === emp.id ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/50' : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-750'}`}
                >
                  <img src={emp.avatar} alt={emp.full_name} className="w-12 h-12 rounded-full object-cover shadow-xs mr-3" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{emp.full_name}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${emp.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-slate-100 text-slate-600 dark:bg-slate-700'}`}>
                        {emp.status === 'active' ? 'Đang làm' : 'Đã nghỉ'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{emp.employee_code} • {emp.job_title}</p>
                  </div>
                </div>
              ))}
              {filteredEmployees.length === 0 && (
                <div className="text-center py-10 text-slate-500 text-sm">Không tìm thấy nhân sự.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Detail/Add View */}
        {(selectedEmployee || isAdding) && (
          <div className="w-full lg:flex-1 h-[calc(100vh-14rem)] overflow-y-auto custom-scrollbar">
            {selectedEmployee && !isAdding && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex justify-between items-start mb-8 relative">
                  <button onClick={() => setSelectedEmployee(null)} className="lg:hidden absolute -top-4 -left-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                    <X size={20} />
                  </button>
                  <div className="flex items-center gap-6 mt-4 lg:mt-0">
                    <img src={selectedEmployee.avatar} alt={selectedEmployee.full_name} className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-md border-4 border-white dark:border-slate-700" />
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">{selectedEmployee.full_name}</h2>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm font-medium">
                        <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-lg">Mã: {selectedEmployee.employee_code}</span>
                        <span className="text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">{selectedEmployee.job_title}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={(e) => handleDelete(e, selectedEmployee.id)} className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors" title="Xoá nhân sự">
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Info */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center border-b border-slate-100 dark:border-slate-700 pb-2">
                      <UserCircle className="mr-2 text-emerald-500" size={20} />
                      Thông tin hồ sơ
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                        <Phone className="text-slate-400 mr-3" size={18} />
                        <div>
                          <p className="text-xs text-slate-500">Số điện thoại</p>
                          <p className="font-medium text-slate-800 dark:text-slate-200">{selectedEmployee.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                        <Mail className="text-slate-400 mr-3" size={18} />
                        <div>
                          <p className="text-xs text-slate-500">Email</p>
                          <p className="font-medium text-slate-800 dark:text-slate-200">{selectedEmployee.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                        <Briefcase className="text-slate-400 mr-3" size={18} />
                        <div>
                          <p className="text-xs text-slate-500">Phòng ban</p>
                          <p className="font-medium text-slate-800 dark:text-slate-200">{selectedEmployee.department}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Employment Status & Permissions */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center border-b border-slate-100 dark:border-slate-700 pb-2">
                      <Calendar className="mr-2 text-emerald-500" size={20} />
                      Công tác & Phân quyền
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                        <div>
                          <p className="text-xs text-slate-500">Ngày vào làm</p>
                          <p className="font-medium text-slate-800 dark:text-slate-200">{new Date(selectedEmployee.join_date).toLocaleDateString('vi-VN')}</p>
                        </div>
                        {selectedEmployee.status === 'resigned' && (
                          <div className="text-right">
                            <p className="text-xs text-red-500">Ngày nghỉ việc</p>
                            <p className="font-medium text-red-600">{selectedEmployee.resign_date ? new Date(selectedEmployee.resign_date).toLocaleDateString('vi-VN') : 'N/A'}</p>
                          </div>
                        )}
                      </div>

                      <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-emerald-800 dark:text-emerald-400 flex items-center">
                            <Shield className="mr-2" size={18} /> Cấp quyền hệ thống
                          </h4>
                          <button className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-700 transition">Thay đổi</button>
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                            <span>Truy cập Mobile App</span>
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${selectedEmployee.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                              <div className={`absolute top-0.5 bg-white w-3 h-3 rounded-full transition-all ${selectedEmployee.status === 'active' ? 'left-4.5' : 'left-0.5'}`} />
                            </div>
                          </label>
                          <label className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                            <span>Quyền quản trị trang Web</span>
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${['admin', 'manager'].includes(selectedEmployee.role) ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                              <div className={`absolute top-0.5 bg-white w-3 h-3 rounded-full transition-all ${['admin', 'manager'].includes(selectedEmployee.role) ? 'left-4.5' : 'left-0.5'}`} />
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isAdding && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
                    <UserPlus className="mr-3 text-emerald-600" size={24} />
                    Thêm nhân sự mới
                  </h2>
                  <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition">
                    <X size={20} />
                  </button>
                </div>

                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsAdding(false); }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mã nhân sự</label>
                      <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="VD: NS-005" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Họ và tên</label>
                      <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="VD: Lê Thị E" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Chức danh</label>
                      <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="VD: Công nhân" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phòng ban</label>
                      <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500">
                        <option>Kỹ thuật</option>
                        <option>Vệ sinh</option>
                        <option>An ninh</option>
                        <option>Ban Giám Đốc</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Số điện thoại</label>
                      <input type="tel" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="090..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ngày vào làm</label>
                      <input type="date" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500" required />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition">
                      Hủy bỏ
                    </button>
                    <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition shadow-lg shadow-emerald-500/30 flex items-center">
                      <FileCheck size={18} className="mr-2" /> Lưu hồ sơ
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
