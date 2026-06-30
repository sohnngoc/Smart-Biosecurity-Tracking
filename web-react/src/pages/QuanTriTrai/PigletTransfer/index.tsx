import { useOutletContext, Link } from 'react-router-dom';
import { Truck, CheckSquare, ArrowRightCircle, ArrowDownCircle, AlertCircle, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { usePigletTransferDashboard } from '../../../hooks/usePigletTransferDashboard';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export default function PigletTransfer() {
  const { farmId, farmCode } = useOutletContext<{ farmId: string, farmCode: string }>();
  const { stats, loading, error } = usePigletTransferDashboard(farmId);
  
  if (loading) {
    return <div className="p-12 text-center text-slate-500">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-lg m-4">Lỗi tải dữ liệu: {error}</div>;
  }

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto min-h-screen">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Truck className="text-emerald-600" />
            Chuồng & Bàn giao heo con
          </h1>
          <p className="text-slate-500 mt-1">Dashboard quản lý quy trình nhập xuất heo cai sữa</p>
        </div>
        
        {/* Quick Actions (Mobile First Design) */}
        <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
          <Link to={`/trai/${farmCode}/piglet-transfer/pen-check`} className="shrink-0 px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg font-medium flex items-center gap-2 border border-amber-200 transition-colors">
            <CheckSquare size={18} />
            Kiểm tra chuồng
          </Link>
          <Link to={`/trai/${farmCode}/piglet-transfer/handover`} className="shrink-0 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium flex items-center gap-2 border border-blue-200 transition-colors">
            <ArrowRightCircle size={18} />
            Bàn giao heo
          </Link>
          <Link to={`/trai/${farmCode}/piglet-transfer/receiving`} className="shrink-0 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-medium flex items-center gap-2 border border-emerald-200 transition-colors">
            <ArrowDownCircle size={18} />
            Nhận heo
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1 truncate">Đợt bàn giao (Tuần)</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats?.handoverCount || 0}</h3>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1 truncate">Tổng heo bàn giao</p>
          <h3 className="text-2xl font-bold text-blue-600">{stats?.totalHandoverQty?.toLocaleString() || 0}</h3>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1 truncate">Tổng heo thực nhận</p>
          <h3 className="text-2xl font-bold text-emerald-600">{stats?.totalReceivedQty?.toLocaleString() || 0}</h3>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1 truncate">Số đợt có sai lệch</p>
          <h3 className="text-2xl font-bold text-amber-500">{stats?.discrepancyBatches || 0}</h3>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1 truncate">Tỷ lệ sai lệch SL</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats?.discrepancyRate?.toFixed(2)}%</h3>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1 truncate">Tỷ lệ heo loại/chết</p>
          <h3 className="text-2xl font-bold text-red-500">{stats?.rejectionRate?.toFixed(2)}%</h3>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-red-200 dark:border-red-900 shadow-sm">
          <p className="text-sm text-red-600 font-medium mb-1 flex items-center gap-1 truncate"><AlertCircle size={14}/> Incident Mở</p>
          <h3 className="text-2xl font-bold text-red-600">{stats?.openIncidents || 0}</h3>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-amber-200 dark:border-amber-900 shadow-sm">
          <p className="text-sm text-amber-600 font-medium mb-1 flex items-center gap-1 truncate"><TrendingUp size={14}/> Task Quá Hạn</p>
          <h3 className="text-2xl font-bold text-amber-600">{stats?.overdueTasks || 0}</h3>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4">Bàn giao vs Thực nhận theo tuần</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" />
                <Bar dataKey="handover" name="Bàn giao" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="received" name="Thực nhận" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm">Vấn đề theo trại nguồn</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.sourceFarmIssues}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats?.sourceFarmIssues?.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Incident nguyên nhân (Mock chart) */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm">Incident theo nguyên nhân</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      {name: 'Thiếu số lượng', value: 3},
                      {name: 'Heo chết/yếu', value: 5},
                      {name: 'Xe chưa sát trùng', value: 1}
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={70}
                    dataKey="value"
                  >
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                    <Cell fill="#64748b" />
                  </Pie>
                  <RechartsTooltip />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-white">Danh sách đợt bàn giao gần nhất</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Ngày nhận</th>
                <th className="px-4 py-3 font-medium">Trại nguồn</th>
                <th className="px-4 py-3 font-medium text-right">Bàn giao</th>
                <th className="px-4 py-3 font-medium text-right">Thực nhận</th>
                <th className="px-4 py-3 font-medium text-right">Sai lệch</th>
                <th className="px-4 py-3 font-medium text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {stats?.recentBatches?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Chưa có dữ liệu bàn giao.
                  </td>
                </tr>
              ) : (
                stats?.recentBatches?.map((batch: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200 whitespace-nowrap">{batch.date}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 min-w-[120px]">{batch.source}</td>
                    <td className="px-4 py-3 text-right text-blue-600 font-medium">{batch.expected}</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">{batch.actual}</td>
                    <td className="px-4 py-3 text-right">
                      {batch.diff === 0 ? (
                        <span className="text-slate-400">-</span>
                      ) : (
                        <span className="text-red-500 font-medium">{batch.diff > 0 ? `+${batch.diff}` : batch.diff}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap
                        ${batch.status === 'Đạt' ? 'bg-emerald-100 text-emerald-700' : 
                          batch.status === 'Cảnh báo' ? 'bg-amber-100 text-amber-700' : 
                          'bg-red-100 text-red-700'}`}>
                        {batch.status === 'Đạt' ? <CheckCircle2 size={12}/> : <AlertTriangle size={12}/>}
                        {batch.status}
                      </span>
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
