import { 
  AlertCircle,
  Syringe,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface VaccineTabProps {
  data: any;
  farmId: string;
  year: number;
  week: number;
}

const Card = ({ children, className }: any) => <div className={cn("bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden", className)}>{children}</div>;
const CardHeader = ({ children, className }: any) => <div className={cn("p-6 pb-4", className)}>{children}</div>;
const CardTitle = ({ children, className }: any) => <h3 className={cn("font-semibold text-lg text-slate-800 dark:text-slate-100", className)}>{children}</h3>;
const CardContent = ({ children, className }: any) => <div className={cn("p-6 pt-0", className)}>{children}</div>;

export default function VaccineTab({ data, week, year }: VaccineTabProps) {
  const vaccineSchedules = data?.vaccineSchedules || [];
  const mortality = data?.mortality || {};

  const totalVaccines = vaccineSchedules.length;
  const overdueVaccines = vaccineSchedules.filter((v: any) => v.status === 'Overdue');
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Planned':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"><Clock size={12} /> Kế hoạch</span>;
      case 'Due Soon':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><AlertTriangle size={12} /> Sắp đến hạn</span>;
      case 'Overdue':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"><XCircle size={12} /> Quá hạn</span>;
      case 'Done':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 size={12} /> Đã tiêm</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  // Check for smart alerts
  const hasMortalitySpike = mortality?.total_dead_rate > 5;
  const hasOverdueVaccines = overdueVaccines.length > 0;
  const showAlert = hasMortalitySpike && hasOverdueVaccines;

  // Chart data: Vaccine completion by type
  const vaccineStats = vaccineSchedules.reduce((acc: any, curr: any) => {
    if (!acc[curr.vaccine_type]) acc[curr.vaccine_type] = { type: curr.vaccine_type, Done: 0, Pending: 0 };
    if (curr.status === 'Done') acc[curr.vaccine_type].Done += curr.quantity;
    else acc[curr.vaccine_type].Pending += curr.quantity;
    return acc;
  }, {});

  const chartData = Object.values(vaccineStats);

  return (
    <div className="space-y-6">
      {/* Smart Alert */}
      {showAlert && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-4 shadow-sm">
          <div className="p-2 bg-red-100 dark:bg-red-800/50 rounded-full text-red-600 dark:text-red-400">
            <AlertCircle size={24} />
          </div>
          <div>
            <h4 className="text-red-800 dark:text-red-300 font-bold text-sm uppercase tracking-wide">Cảnh báo rủi ro dịch bệnh</h4>
            <p className="text-red-700 dark:text-red-400 text-sm mt-1 leading-relaxed">
              Tỷ lệ chết của heo con đang ở mức <span className="font-semibold text-red-800">{mortality.total_dead_rate}%</span> (vượt ngưỡng 5%), 
              đồng thời phát hiện <span className="font-semibold text-red-800">{overdueVaccines.length}</span> lịch vaccine đang bị <span className="font-semibold text-red-800 underline">Quá hạn</span>.
              Đề nghị kiểm tra và tiêm phòng ngay lập tức.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Syringe size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Tổng lịch vaccine tuần {week}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalVaccines}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Lịch tiêm Quá hạn (Overdue)</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{overdueVaccines.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Đã hoàn thành</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {vaccineSchedules.filter((v: any) => v.status === 'Done').length}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Tiến độ theo Loại Vaccine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="type" axisLine={false} tickLine={false} fontSize={12} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="Done" name="Đã tiêm (con)" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={30} />
                  <Bar dataKey="Pending" name="Chưa tiêm (con)" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Table Gilt Vaccines */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
            <CardTitle>Lịch Vaccine Hậu Bị</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto max-h-64 custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-semibold">Tuần nhập</th>
                  <th className="px-4 py-3 font-semibold text-center">Số lượng</th>
                  <th className="px-3 py-3 font-semibold text-center whitespace-nowrap">PED1+AD+Ghẻ</th>
                  <th className="px-3 py-3 font-semibold text-center whitespace-nowrap">PRRS1+Parvo1</th>
                  <th className="px-3 py-3 font-semibold text-center whitespace-nowrap">CSF+Circo</th>
                  <th className="px-3 py-3 font-semibold text-center whitespace-nowrap">PED2+LMLM</th>
                  <th className="px-3 py-3 font-semibold text-center whitespace-nowrap">Parvo2+PRRS2</th>
                  <th className="px-4 py-3 font-semibold text-center">Trạng thái chung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">W{week - 4}/{year}</td>
                  <td className="px-4 py-3 text-center">45</td>
                  <td className="px-3 py-3 text-center"><CheckCircle2 size={16} className="mx-auto text-emerald-500" /></td>
                  <td className="px-3 py-3 text-center"><CheckCircle2 size={16} className="mx-auto text-emerald-500" /></td>
                  <td className="px-3 py-3 text-center"><CheckCircle2 size={16} className="mx-auto text-emerald-500" /></td>
                  <td className="px-3 py-3 text-center"><Clock size={16} className="mx-auto text-slate-400" /></td>
                  <td className="px-3 py-3 text-center"><Clock size={16} className="mx-auto text-slate-400" /></td>
                  <td className="px-4 py-3 text-center">{getStatusBadge('Planned')}</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">W{week - 6}/{year}</td>
                  <td className="px-4 py-3 text-center">32</td>
                  <td className="px-3 py-3 text-center"><CheckCircle2 size={16} className="mx-auto text-emerald-500" /></td>
                  <td className="px-3 py-3 text-center"><CheckCircle2 size={16} className="mx-auto text-emerald-500" /></td>
                  <td className="px-3 py-3 text-center"><CheckCircle2 size={16} className="mx-auto text-emerald-500" /></td>
                  <td className="px-3 py-3 text-center"><CheckCircle2 size={16} className="mx-auto text-emerald-500" /></td>
                  <td className="px-3 py-3 text-center"><AlertTriangle size={16} className="mx-auto text-amber-500" /></td>
                  <td className="px-4 py-3 text-center">{getStatusBadge('Due Soon')}</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">W{week - 8}/{year}</td>
                  <td className="px-4 py-3 text-center">50</td>
                  <td className="px-3 py-3 text-center"><CheckCircle2 size={16} className="mx-auto text-emerald-500" /></td>
                  <td className="px-3 py-3 text-center"><CheckCircle2 size={16} className="mx-auto text-emerald-500" /></td>
                  <td className="px-3 py-3 text-center"><CheckCircle2 size={16} className="mx-auto text-emerald-500" /></td>
                  <td className="px-3 py-3 text-center"><CheckCircle2 size={16} className="mx-auto text-emerald-500" /></td>
                  <td className="px-3 py-3 text-center"><XCircle size={16} className="mx-auto text-red-500" /></td>
                  <td className="px-4 py-3 text-center">{getStatusBadge('Overdue')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Table Other Vaccines */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
            <CardTitle>Lịch Vaccine Nái, Nọc, Heo con (W{week}/{year})</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto max-h-80 custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-semibold">Loại heo</th>
                  <th className="px-6 py-4 font-semibold">Lô/Nhóm</th>
                  <th className="px-6 py-4 font-semibold">Loại Vaccine</th>
                  <th className="px-6 py-4 font-semibold">TP/TT (Tuần)</th>
                  <th className="px-6 py-4 font-semibold text-center">SL (Con)</th>
                  <th className="px-6 py-4 font-semibold">Người phụ trách</th>
                  <th className="px-6 py-4 font-semibold text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vaccineSchedules.filter((v: any) => v.pig_type !== 'Hậu bị').length > 0 ? (
                  vaccineSchedules.filter((v: any) => v.pig_type !== 'Hậu bị').map((vax: any) => {
                    let parsedNotes = { tp: '', tt: '', staff: '' };
                    try {
                      if (vax.notes && vax.notes.startsWith('{')) {
                        parsedNotes = JSON.parse(vax.notes);
                      }
                    } catch (e) {
                      // ignore
                    }
                    return (
                      <tr key={vax.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">{vax.pig_type}</td>
                        <td className="px-6 py-4 text-slate-600">{vax.batch_name}</td>
                        <td className="px-6 py-4 font-medium text-indigo-600">{vax.vaccine_type}</td>
                        <td className="px-6 py-4">
                          {parsedNotes.tp && <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-semibold border border-amber-100">TP: {parsedNotes.tp}</span>}
                          {parsedNotes.tt && <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold border border-blue-100">TT: {parsedNotes.tt}</span>}
                          {!parsedNotes.tp && !parsedNotes.tt && <span className="text-slate-400">-</span>}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-700 bg-slate-50/50">{vax.quantity}</td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{parsedNotes.staff || (vax.notes && !vax.notes.startsWith('{') ? vax.notes : '-')}</td>
                        <td className="px-6 py-4 text-center">{getStatusBadge(vax.status)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      Không có lịch vaccine trong tuần này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
