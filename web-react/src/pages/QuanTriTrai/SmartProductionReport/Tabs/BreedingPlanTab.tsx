import { useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Target, Activity, AlertTriangle } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface BreedingPlanTabProps {
  data: any;
  week: number;
  year: number;
}

// Simple Card replacements
const Card = ({ children, className }: any) => <div className={cn("bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm", className)}>{children}</div>;
const CardHeader = ({ children, className }: any) => <div className={cn("p-6 pb-4", className)}>{children}</div>;
const CardTitle = ({ children, className }: any) => <h3 className={cn("font-semibold text-slate-800 dark:text-white leading-none tracking-tight", className)}>{children}</h3>;
const CardDescription = ({ children, className }: any) => <p className={cn("text-sm text-slate-500 dark:text-slate-400 mt-1.5", className)}>{children}</p>;
const CardContent = ({ children, className }: any) => <div className={cn("p-6 pt-0", className)}>{children}</div>;

export default function BreedingPlanTab({ data, week }: BreedingPlanTabProps) {
  const { breeding, farrowing } = data || {};

  // Forecast data generation (Mocking past 17 weeks of breeding to project next 17 weeks of farrowing)
  const forecastData = useMemo(() => {
    const projected = [];
    const baseBreeding = breeding?.actual_count || 130;
    const pregRate = (breeding?.pregnancy_rate || 88) / 100;
    const lps = farrowing?.liveborn_per_sow || 11.5;

    for (let i = 1; i <= 17; i++) {
      let mockBred = Math.floor(baseBreeding * (0.9 + Math.random() * 0.2));
      if (i === 17) mockBred = baseBreeding; // Week 17 is from current week's breeding

      const expFarrow = Math.floor(mockBred * pregRate);
      const expBorn = Math.floor(expFarrow * lps);

      projected.push({
        week: `W${week + i > 52 ? week + i - 52 : week + i}`,
        bred: mockBred,
        expectedFarrowing: expFarrow,
        expectedBorn: expBorn,
        isCurrentBreedingTarget: i === 17
      });
    }
    return projected;
  }, [breeding, farrowing, week]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Chỉ tiêu tuần</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                  {breeding?.target_count || 0} <span className="text-sm font-normal text-slate-500">nái</span>
                </h3>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <Target className="text-slate-600 dark:text-slate-300" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Kế hoạch phối</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                  {breeding?.plan_count || 0} <span className="text-sm font-normal text-slate-500">nái</span>
                </h3>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Activity className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Thực tế phối</p>
                <div className="flex items-end gap-2 mt-1">
                  <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {breeding?.actual_count || 0}
                  </h3>
                  <span className="text-sm font-medium text-emerald-600 mb-1">
                    ({breeding?.actual_rate || 0}%)
                  </span>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                <CheckCircleIcon className="text-emerald-600 dark:text-emerald-400" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Heo vấn đề</p>
                <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {breeding?.problem_sows || 0} <span className="text-sm font-normal text-red-400">nái</span>
                </h3>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nguồn Phối */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Phân rã nguồn phối</CardTitle>
            <CardDescription>Cơ cấu nái đưa vào phối trong tuần</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <SourceRow label="Phối từ heo cai sữa" value={breeding?.from_weaned_sows} total={breeding?.actual_count} color="bg-emerald-500" />
              <SourceRow label="Phối hậu bị" value={breeding?.from_gilts} total={breeding?.actual_count} color="bg-blue-500" />
              <SourceRow label="Phối lại" value={breeding?.from_rebreeding} total={breeding?.actual_count} color="bg-amber-500" />
              <SourceRow label="Heo vấn đề (Loại/Chết/Đợi)" value={breeding?.problem_sows} total={breeding?.actual_count + breeding?.problem_sows} color="bg-red-500" />
            </div>
          </CardContent>
        </Card>

        {/* Bảng Phối Lại & Nguyên Nhân */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Chi tiết phối lại & Cai sữa</CardTitle>
            <CardDescription>Nguyên nhân heo không phối được</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Nái cai sữa tuần</p>
                <p className="text-xl font-semibold text-slate-800 dark:text-white">{breeding?.weaned_sows || 0}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Tỷ lệ phối lại (%)</p>
                <p className="text-xl font-semibold text-slate-800 dark:text-white">{breeding?.rebreeding_rate || 0}%</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <CauseRow label="Chậm giống" value={breeding?.cause_anestrus} />
              <CauseRow label="Viêm mủ" value={breeding?.cause_purulent} />
              <CauseRow label="Đau chân" value={breeding?.cause_lame} />
              <CauseRow label="Không phê" value={breeding?.cause_no_heat} />
              <CauseRow label="Chết" value={breeding?.cause_dead} />
              <CauseRow label="Gầy yếu" value={breeding?.cause_weak} />
              <CauseRow label="Vấn đề khác" value={breeding?.cause_other} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg">Dự báo đẻ & sơ sinh 17 tuần tới</CardTitle>
          <CardDescription>
            Ước tính dựa trên số phối tuần này ({breeding?.actual_count}) và tỉ lệ mang thai ({breeding?.pregnancy_rate}%), tỉ lệ đẻ thực tế.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis yAxisId="left" orientation="left" stroke="#10b981" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey="expectedFarrowing" name="Dự kiến số nái đẻ" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar yAxisId="right" dataKey="expectedBorn" name="Dự kiến số sơ sinh sống" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helpers for UI
function CheckCircleIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <path d="m9 11 3 3L22 4"/>
    </svg>
  );
}

function SourceRow({ label, value, total, color }: { label: string, value: number, total: number, color: string }) {
  const percent = total > 0 ? Math.round(((value || 0) / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1 text-sm">
        <span className="text-slate-600 dark:text-slate-300 font-medium">{label}</span>
        <span className="text-slate-800 dark:text-white font-bold">{value || 0} <span className="text-slate-400 font-normal text-xs ml-1">({percent}%)</span></span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
        <div className={cn("h-2 rounded-full", color)} style={{ width: `${percent}%` }}></div>
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
