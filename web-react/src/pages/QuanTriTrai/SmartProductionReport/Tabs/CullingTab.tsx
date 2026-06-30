import { 
  AlertCircle,
  FileText,
  Search,
  Filter,
  Plus,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  BarChart4
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line } from 'recharts';

interface CullingTabProps {
  data: any;
  farmId: string;
  year: number;
  week: number;
}

const Card = ({ children, className }: any) => <div className={cn("bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden", className)}>{children}</div>;
const CardHeader = ({ children, className }: any) => <div className={cn("p-6 pb-4", className)}>{children}</div>;
const CardTitle = ({ children, className }: any) => <h3 className={cn("font-semibold text-lg text-slate-800 dark:text-slate-100", className)}>{children}</h3>;
const CardContent = ({ children, className }: any) => <div className={cn("p-6 pt-0", className)}>{children}</div>;

export default function CullingTab({ data, week }: CullingTabProps) {
  const cullingRequests = data?.cullingRequests || [];

  // Calculate metrics
  const totalRequests = cullingRequests.length;
  const pendingRequests = cullingRequests.filter((r: any) => ['Draft', 'Submitted'].includes(r.status)).length;
  const approvedRequests = cullingRequests.filter((r: any) => ['Vet Approved', 'Completed'].includes(r.status)).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Draft':
      case 'Submitted':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><Clock size={12} /> Chờ duyệt</span>;
      case 'Vet Approved':
      case 'Completed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 size={12} /> Đã duyệt</span>;
      case 'Rejected':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"><XCircle size={12} /> Từ chối</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  const getPigTypeBadge = (type: string) => {
    if (['Nái', 'Hậu bị', 'Nọc'].includes(type)) {
      return <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">{type}</span>;
    }
    return <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">{type}</span>;
  };

  // Group by Pig Type
  const pigTypeGroups = ['Nọc', 'Hậu bị', 'Nái', 'W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'];
  const reportByPigType = pigTypeGroups.map(type => {
    const count = cullingRequests.filter((r: any) => r.pig_type === type).length;
    return { type, count };
  });

  // Pareto Chart Data (Reasons)
  const reasonCounts = cullingRequests.reduce((acc: any, curr: any) => {
    acc[curr.reason] = (acc[curr.reason] || 0) + 1;
    return acc;
  }, {});

  const paretoData = Object.keys(reasonCounts)
    .map(reason => ({ reason, count: reasonCounts[reason], cumulativePercentage: 0 }))
    .sort((a, b) => b.count - a.count);

  let cumulativeCount = 0;
  const totalReasonCount = paretoData.reduce((sum, item) => sum + item.count, 0);
  
  paretoData.forEach((item) => {
    cumulativeCount += item.count;
    item.cumulativePercentage = totalReasonCount > 0 ? Number(((cumulativeCount / totalReasonCount) * 100).toFixed(1)) : 0;
  });

  // Check for smart alerts (Mock logic: if 'Viêm mủ' > 2)
  const hasAlert = paretoData.some(p => p.count > 2);
  const alertReason = hasAlert ? paretoData[0]?.reason : null;

  return (
    <div className="space-y-6">
      {/* Smart Alert */}
      {hasAlert && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-4">
          <div className="p-2 bg-red-100 dark:bg-red-800/50 rounded-full text-red-600 dark:text-red-400">
            <AlertCircle size={24} />
          </div>
          <div>
            <h4 className="text-red-800 dark:text-red-300 font-bold text-sm uppercase tracking-wide">Cảnh báo loại heo bất thường</h4>
            <p className="text-red-700 dark:text-red-400 text-sm mt-1">
              Nguyên nhân <span className="font-semibold">"{alertReason}"</span> đang chiếm tỷ lệ cao nhất trong tuần {week}. 
              Cần kiểm tra quy trình chăm sóc và phòng dịch khu vực liên quan.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Tổng số phiếu đăng ký</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalRequests}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Chờ duyệt (Draft/Submitted)</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{pendingRequests}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Đã duyệt (Vet/Completed)</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{approvedRequests}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart: Phân loại theo nhóm heo */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart4 size={18} className="text-indigo-500" />
              Thống kê theo nhóm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportByPigType} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="type" type="category" axisLine={false} tickLine={false} fontSize={12} width={60} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pareto Chart: Nguyên nhân loại */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={18} className="text-rose-500" />
              Biểu đồ Pareto - Nguyên nhân loại
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={paretoData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="reason" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} tickFormatter={(val) => `${val}%`} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" name="Số lượng" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Line yAxisId="right" type="monotone" dataKey="cumulativePercentage" name="Tích lũy (%)" stroke="#0f172a" strokeWidth={2} dot={{ r: 4, fill: '#0f172a' }} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form/Table Đăng ký loại */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
          <CardTitle>Danh sách Đăng ký Loại heo</CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Tìm số tai..." 
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              <Filter size={16} />
              Lọc
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20">
              <Plus size={16} />
              Tạo phiếu
            </button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Số tai</th>
                <th className="px-6 py-4 font-semibold">Loại heo</th>
                <th className="px-6 py-4 font-semibold text-center">Lứa</th>
                <th className="px-6 py-4 font-semibold">Nguyên nhân</th>
                <th className="px-6 py-4 font-semibold">Ngày vấn đề</th>
                <th className="px-6 py-4 font-semibold">Ngày bắt lô 888</th>
                <th className="px-6 py-4 font-semibold">Người tạo</th>
                <th className="px-6 py-4 font-semibold text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cullingRequests.length > 0 ? (
                cullingRequests.map((req: any) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{req.ear_tag}</td>
                    <td className="px-6 py-4">{getPigTypeBadge(req.pig_type)}</td>
                    <td className="px-6 py-4 text-center font-medium text-slate-600">{req.parity}</td>
                    <td className="px-6 py-4 text-slate-600">{req.reason}</td>
                    <td className="px-6 py-4 text-slate-600">{req.issue_date}</td>
                    <td className="px-6 py-4 text-slate-600">{req.batch_888_date}</td>
                    <td className="px-6 py-4 text-slate-600">{req.creator}</td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(req.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="text-slate-300 mb-3" size={32} />
                      <p>Không có dữ liệu đăng ký loại heo trong tuần {week}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
