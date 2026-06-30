import { useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Legend, ComposedChart, Line } from 'recharts';
import { Target, Activity, AlertTriangle, Truck, Weight, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { useTrendData } from '../../../../hooks/useProductionReport';

interface WeanedExportTabProps {
  data: any;
  farmId: string | undefined;
  year: number;
  week: number;
}

// Simple Card replacements
const Card = ({ children, className }: any) => <div className={cn("bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm", className)}>{children}</div>;
const CardHeader = ({ children, className }: any) => <div className={cn("p-6 pb-4", className)}>{children}</div>;
const CardTitle = ({ children, className }: any) => <h3 className={cn("font-semibold text-slate-800 dark:text-white leading-none tracking-tight", className)}>{children}</h3>;
const CardDescription = ({ children, className }: any) => <p className={cn("text-sm text-slate-500 dark:text-slate-400 mt-1.5", className)}>{children}</p>;
const CardContent = ({ children, className }: any) => <div className={cn("p-6 pt-0", className)}>{children}</div>;

export default function WeanedExportTab({ data, farmId, year, week }: WeanedExportTabProps) {
  const { export: exportData } = data || {};
  const { trends } = useTrendData(farmId, year, week);

  // Generate chart data from trends
  const chartData = useMemo(() => {
    if (!trends || trends.length === 0) return [];
    return trends.map((t: any) => ({
      week: `Tuần ${t.week_no}`,
      plan: t.export?.export_plan || 0,
      actual: t.export?.export_actual || 0,
      inventory: t.export?.end_inventory || 0
    }));
  }, [trends]);

  const exportIssueRate = useMemo(() => {
    if (!exportData || !exportData.export_plan) return 0;
    const diff = exportData.export_plan - exportData.export_actual;
    if (diff <= 0) return 0;
    return (diff / exportData.export_plan) * 100;
  }, [exportData]);

  // Alerts logic
  const alerts = [];
  if (exportIssueRate > 5) {
    alerts.push(`Không xuất được vượt ngưỡng 5% (Thực tế: ${exportIssueRate.toFixed(1)}%). Kiểm tra lại lý do vận chuyển hoặc hoãn.`);
  }
  if (exportData?.end_inventory > exportData?.export_actual) {
    alerts.push(`Tồn heo con tăng cao bất thường (${exportData.end_inventory} con). Cần điều phối xuất khẩn cấp.`);
  }
  if (exportData?.avg_weight < 5.5) {
    alerts.push(`Trọng lượng bình quân xuất (${exportData.avg_weight} kg) thấp hơn tiêu chuẩn (5.5 kg). Đề nghị kiểm tra dinh dưỡng cám cai sữa.`);
  }

  return (
    <div className="space-y-6">
      {/* Alert Section */}
      {alerts.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-amber-600 dark:text-amber-500" size={20} />
            <h4 className="font-semibold text-amber-800 dark:text-amber-500">Cảnh báo xuất heo (Auto-detected)</h4>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm text-amber-700 dark:text-amber-400">
            {alerts.map((alert, idx) => (
              <li key={idx}>{alert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Kế hoạch xuất</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                  {exportData?.export_plan || 0} <span className="text-sm font-normal text-slate-500">con</span>
                </h3>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Target className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Thực tế xuất</p>
                <div className="flex items-end gap-2 mt-1">
                  <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {exportData?.export_actual || 0}
                  </h3>
                  <span className={cn("text-sm font-medium mb-1", exportData?.export_balance >= 0 ? "text-emerald-600" : "text-red-500")}>
                    {exportData?.export_balance > 0 ? '+' : ''}{exportData?.export_balance || 0}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                <Truck className="text-emerald-600 dark:text-emerald-400" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tồn cuối tuần</p>
                <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-500 mt-1">
                  {exportData?.end_inventory || 0} <span className="text-sm font-normal text-amber-500/70">con</span>
                </h3>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                <Activity className="text-amber-600 dark:text-amber-500" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Bình quân / con</p>
                <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  {exportData?.avg_weight || 0} <span className="text-sm font-normal text-indigo-400/70">kg</span>
                </h3>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <Weight className="text-indigo-600 dark:text-indigo-400" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart: KH vs TT vs Tồn */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">KH xuất vs TT xuất (4 tuần)</CardTitle>
            <CardDescription>Biểu đồ so sánh lượng xuất và tồn kho heo cai sữa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar yAxisId="left" dataKey="plan" name="Kế hoạch xuất" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar yAxisId="left" dataKey="actual" name="Thực tế xuất" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                  <Line yAxisId="right" type="monotone" dataKey="inventory" name="Tồn cuối" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bảng Chi tiết */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin chốt phiếu & Vận chuyển</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Truck size={18} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Trại nhận</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800 dark:text-white">{exportData?.receiver_farm || 'Chưa cập nhật'}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Số phiếu xuất</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800 dark:text-white">{exportData?.ticket_count || 0} phiếu</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Trạng thái chốt phiếu</span>
                  </div>
                  <span className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded-full",
                    exportData?.ticket_status === 'Chốt đủ' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                    exportData?.ticket_status === 'Thiếu phiếu' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  )}>
                    {exportData?.ticket_status || 'Chưa rõ'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lý do không xuất được</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <CauseRow label="Nái hoãn" value={exportData?.reason_sow_delay} />
                <CauseRow label="Vận chuyển" value={exportData?.reason_transport} />
                <CauseRow label="Hậu bị hoãn" value={exportData?.reason_gilt_delay} />
                <div className="flex justify-between items-center py-1.5 mt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Tổng heo giữ lại</span>
                  <span className="text-sm font-bold text-red-600">
                    {(exportData?.reason_sow_delay || 0) + (exportData?.reason_transport || 0) + (exportData?.reason_gilt_delay || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CauseRow({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-dashed border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{value || 0}</span>
    </div>
  );
}
