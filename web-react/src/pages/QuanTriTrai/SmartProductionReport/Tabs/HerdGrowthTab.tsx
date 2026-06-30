
import { cn } from '../../../../lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, LineChart, Line } from 'recharts';

interface HerdGrowthTabProps {
  data: any;
  farmId: string;
  year: number;
  week: number;
}

const Card = ({ children, className }: any) => <div className={cn("bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col", className)}>{children}</div>;
const CardHeader = ({ children, className }: any) => <div className={cn("p-6 pb-4", className)}>{children}</div>;
const CardTitle = ({ children, className }: any) => <h3 className={cn("font-semibold text-lg text-slate-800 dark:text-slate-100", className)}>{children}</h3>;
const CardContent = ({ children, className }: any) => <div className={cn("p-6 pt-0 flex-1", className)}>{children}</div>;

export default function HerdGrowthTab({ data, week }: HerdGrowthTabProps) {
  const herdGrowthPlans = data?.herdGrowthPlans || [];
  const giltBatches = data?.giltBatches || [];

  const currentPlan = herdGrowthPlans[0] || {};
  const {
    scale = 2400,
    target_productive_sows = 2200,
    actual_productive_sows = 2150,
    current_gilts = 350,
    gilt_increase = 12,
    total_herd = 2500,
    total_herd_increase = 5,
    target_achieved_pct = 97.7,
    gilt_imported = 45,
    sows_bred = 65
  } = currentPlan;

  // Enhance gilt batches with calculated rates
  const enhancedBatches = giltBatches.map((b: any) => {
    const deadRate = ((b.dead_count / b.import_count) * 100).toFixed(1);
    const cullRate = ((b.cull_count / b.import_count) * 100).toFixed(1);
    const bredRate = ((b.bred_count / b.import_count) * 100).toFixed(1);
    const remaining = b.import_count - b.dead_count - b.cull_count - b.bred_count;
    return { ...b, deadRate, cullRate, bredRate, remaining };
  });

  // Chart data: Actual vs Target
  const herdChartData = [
    { name: 'Nái sinh sản', 'Thực tế': actual_productive_sows, 'Mục tiêu': target_productive_sows },
    { name: 'Tổng đàn quy định', 'Thực tế': total_herd, 'Mục tiêu': scale }
  ];

  // Chart data: Gilt pipeline
  const pipelineData = enhancedBatches.map((b: any) => ({
    month: b.batch_month,
    'Nhập': b.import_count,
    'Vào phối': b.bred_count,
    'Chết/Loại': b.dead_count + b.cull_count,
    'Tồn': b.remaining
  })).reverse();

  // Chart data: Survival rate (Mocking trend over last 6 batches)
  const survivalData = pipelineData.map((d: any) => ({
    month: d.month,
    rate: (((d['Nhập'] - d['Chết/Loại']) / d['Nhập']) * 100).toFixed(1)
  }));

  return (
    <div className="space-y-6">
      
      {/* Target Progress */}
      <Card className="bg-linear-to-r from-emerald-600 to-teal-600 text-white border-none shadow-md">
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-emerald-100 font-medium uppercase tracking-wider text-sm mb-2">Lộ trình Tăng đàn - Mức độ hoàn thành</h3>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-black">{target_achieved_pct}%</span>
              <span className="text-emerald-200 mb-1 font-medium">Mục tiêu nái sinh sản</span>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="flex justify-between text-sm mb-2 font-medium">
              <span>Thực tế: {actual_productive_sows} Nái</span>
              <span>Quy định: {target_productive_sows} Nái</span>
            </div>
            <div className="h-4 w-full bg-emerald-900/40 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-white rounded-full relative transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(target_achieved_pct, 100)}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-center">
          <p className="text-sm text-slate-500 font-medium mb-1">Quy mô thiết kế</p>
          <h3 className="text-2xl font-bold text-slate-800">{scale}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
          <p className="text-sm text-slate-500 font-medium mb-1">Tổng đàn hiện tại</p>
          <h3 className="text-2xl font-bold text-slate-800">{total_herd}</h3>
          <span className={cn("text-xs font-semibold mt-1 inline-block", total_herd_increase >= 0 ? "text-emerald-500" : "text-rose-500")}>
            {total_herd_increase >= 0 ? '+' : ''}{total_herd_increase} so với tuần trước
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-pink-500" />
          <p className="text-sm text-slate-500 font-medium mb-1">Hậu bị hiện tại</p>
          <h3 className="text-2xl font-bold text-slate-800">{current_gilts}</h3>
          <span className={cn("text-xs font-semibold mt-1 inline-block", gilt_increase >= 0 ? "text-emerald-500" : "text-rose-500")}>
            {gilt_increase >= 0 ? '+' : ''}{gilt_increase} so với tuần trước
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-center">
          <p className="text-sm text-slate-500 font-medium mb-1">Nhập hậu bị (W{week})</p>
          <h3 className="text-2xl font-bold text-slate-800">{gilt_imported}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-center">
          <p className="text-sm text-slate-500 font-medium mb-1">Vào phối nái (W{week})</p>
          <h3 className="text-2xl font-bold text-slate-800">{sows_bred}</h3>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quy mô Thực tế vs Mục tiêu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={herdChartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" />
                  <Bar dataKey="Thực tế" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="Mục tiêu" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Gilt Replacement Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNhap" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPhoi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" />
                  <Area type="monotone" dataKey="Nhập" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorNhap)" />
                  <Area type="monotone" dataKey="Vào phối" stroke="#10b981" fillOpacity={1} fill="url(#colorPhoi)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Tỷ lệ Sống sót của Hậu bị (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={survivalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} domain={[80, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="rate" name="Tỷ lệ sống" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff'}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle>Theo dõi Hậu bị thay đàn theo Lô (Batch)</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-semibold">Tháng nhập</th>
                <th className="px-4 py-3 font-semibold text-center">Nguồn</th>
                <th className="px-4 py-3 font-semibold text-center bg-indigo-50/50">SL Nhập</th>
                <th className="px-4 py-3 font-semibold text-center">Tuổi TB (ngày)</th>
                <th className="px-4 py-3 font-semibold text-center bg-rose-50/50">Chết</th>
                <th className="px-4 py-3 font-semibold text-center bg-rose-50/50">% Chết</th>
                <th className="px-4 py-3 font-semibold text-center bg-orange-50/50">Loại</th>
                <th className="px-4 py-3 font-semibold text-center bg-orange-50/50">% Loại</th>
                <th className="px-4 py-3 font-semibold text-center bg-emerald-50/50">Vào phối</th>
                <th className="px-4 py-3 font-semibold text-center bg-emerald-50/50">% Phối</th>
                <th className="px-4 py-3 font-semibold text-center">Tuổi phối TB</th>
                <th className="px-4 py-3 font-semibold text-center">Tồn lại</th>
                <th className="px-4 py-3 font-semibold">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enhancedBatches.length > 0 ? (
                enhancedBatches.map((batch: any, idx: number) => (
                  <tr key={batch.id || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{batch.batch_month}</td>
                    <td className="px-4 py-3 text-center text-slate-500 whitespace-nowrap">{batch.source_farm}</td>
                    <td className="px-4 py-3 text-center font-bold text-indigo-600 bg-indigo-50/20">{batch.import_count}</td>
                    <td className="px-4 py-3 text-center">{batch.avg_import_age}</td>
                    <td className="px-4 py-3 text-center text-rose-600 font-medium bg-rose-50/20">{batch.dead_count}</td>
                    <td className="px-4 py-3 text-center text-rose-500 bg-rose-50/20">{batch.deadRate}%</td>
                    <td className="px-4 py-3 text-center text-orange-600 font-medium bg-orange-50/20">{batch.cull_count}</td>
                    <td className="px-4 py-3 text-center text-orange-500 bg-orange-50/20">{batch.cullRate}%</td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-600 bg-emerald-50/20">{batch.bred_count}</td>
                    <td className="px-4 py-3 text-center text-emerald-600 font-medium bg-emerald-50/20">{batch.bredRate}%</td>
                    <td className="px-4 py-3 text-center">{batch.avg_bred_age || '-'}</td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">{batch.remaining}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs min-w-[120px]">{batch.notes || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} className="px-4 py-12 text-center text-slate-500">
                    Không có dữ liệu thay đàn.
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
