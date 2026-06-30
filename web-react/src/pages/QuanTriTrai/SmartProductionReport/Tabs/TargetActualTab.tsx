import { calculateDelta, calculateStatus, safeDivide } from '../../../../utils/reportUtils';
import { CheckCircle2, AlertTriangle, AlertCircle, Minus } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { useTrendData } from '../../../../hooks/useProductionReport';

interface TargetActualTabProps {
  data: any;
  farmId: string | undefined;
  year: number;
  week: number;
}

export default function TargetActualTab({ data, farmId, year, week }: TargetActualTabProps) {
  const { trends, loading: trendsLoading } = useTrendData(farmId, year, week);

  const { report, breeding, farrowing, mortality, export: exportData, targets } = data || {};

  const getTarget = (metricCode: string) => {
    return targets?.find((t: any) => t.metric_code === metricCode);
  };

  const getTrendData = (accessor: (weekData: any) => number | null | undefined) => {
    if (!trends || trends.length === 0) return [];
    return trends.map(t => accessor(t));
  };

  const renderTrend = (values: (number | null | undefined)[], direction: string) => {
    if (values.length < 2) return <span className="text-slate-300">-</span>;
    const validValues = values.filter(v => v != null) as number[];
    if (validValues.length < 2) return <span className="text-slate-300">-</span>;

    const first = validValues[0];
    const last = validValues[validValues.length - 1];
    
    let isUp = last > first;
    let isGood = direction === 'higher_is_better' ? isUp : !isUp;
    if (direction === 'target_range') isGood = true;

    return (
      <div className="flex items-center gap-1">
        <div className="flex items-end gap-0.5 h-6">
          {values.map((v, i) => {
            if (v == null) return <div key={i} className="w-1.5 h-1 bg-slate-200 rounded-sm"></div>;
            const max = Math.max(...validValues) || 1;
            const height = Math.max(10, (v / max) * 100);
            return (
              <div 
                key={i} 
                className={cn("w-1.5 rounded-sm opacity-70", isGood ? "bg-emerald-500" : "bg-slate-400")}
                style={{ height: `${height}%` }}
              ></div>
            );
          })}
        </div>
      </div>
    );
  };

  const MetricRow = ({ metricCode, title, actual, plan, accessor }: any) => {
    const targetObj = getTarget(metricCode);
    const stdValue = targetObj?.std_value;
    const direction = targetObj?.direction || 'higher_is_better';
    const unit = targetObj?.unit || '';

    const delta = calculateDelta(actual, plan ?? stdValue);
    const status = calculateStatus(actual, plan ?? stdValue, direction, targetObj?.warning_threshold, targetObj?.critical_threshold);
    const trendValues = getTrendData(accessor);

    const formatNumber = (val: any) => {
      if (val == null || isNaN(val)) return 'N/A';
      return Number.isInteger(val) ? val : parseFloat(val).toFixed(2);
    };

    return (
      <tr className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/50 transition-colors">
        <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{title}</td>
        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-right">{formatNumber(stdValue)} {stdValue != null && unit}</td>
        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-right">{plan != null ? formatNumber(plan) : '-'}</td>
        <td className="py-3 px-4 font-bold text-slate-800 dark:text-white text-right">{formatNumber(actual)}</td>
        <td className="py-3 px-4 text-right">
          <span className={cn(
            "text-sm font-medium",
            delta && delta > 0 ? (direction === 'higher_is_better' ? 'text-emerald-600' : 'text-red-600') :
            delta && delta < 0 ? (direction === 'higher_is_better' ? 'text-red-600' : 'text-emerald-600') :
            'text-slate-500'
          )}>
            {delta != null ? (delta > 0 ? `+${formatNumber(delta)}` : formatNumber(delta)) : '-'}
          </span>
        </td>
        <td className="py-3 px-4 text-center">
          <div className="flex justify-center">
            {status === 'good' && <CheckCircle2 size={18} className="text-emerald-500" />}
            {status === 'warning' && <AlertTriangle size={18} className="text-amber-500" />}
            {status === 'critical' && <AlertCircle size={18} className="text-red-500" />}
            {status === 'neutral' && <Minus size={18} className="text-slate-300" />}
          </div>
        </td>
        <td className="py-3 px-4">
          <div className="flex justify-center">
            {trendsLoading ? <span className="text-xs text-slate-400">...</span> : renderTrend(trendValues, direction)}
          </div>
        </td>
      </tr>
    );
  };

  const GroupHeader = ({ title }: { title: string }) => (
    <tr className="bg-slate-50 dark:bg-slate-800/50">
      <td colSpan={7} className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200 uppercase text-xs tracking-wider">
        {title}
      </td>
    </tr>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <tr>
              <th className="py-3 px-4 font-semibold">Chỉ tiêu</th>
              <th className="py-3 px-4 font-semibold text-right">STD</th>
              <th className="py-3 px-4 font-semibold text-right">Mục tiêu tuần</th>
              <th className="py-3 px-4 font-semibold text-right">Thực tế tuần</th>
              <th className="py-3 px-4 font-semibold text-right">Chênh lệch</th>
              <th className="py-3 px-4 font-semibold text-center">Trạng thái</th>
              <th className="py-3 px-4 font-semibold text-center">Xu hướng (4 tuần)</th>
            </tr>
          </thead>
          <tbody>
            <GroupHeader title="A. Quy mô đàn" />
            <MetricRow title="Số nọc hoạt động" metricCode="boars" actual={report?.boars} accessor={(w: any) => w.report?.boars} />
            <MetricRow title="Số nái sinh sản" metricCode="productive_sows" actual={report?.productive_sows} accessor={(w: any) => w.report?.productive_sows} />
            <MetricRow title="Số nái hậu bị" metricCode="gilts" actual={report?.gilts} accessor={(w: any) => w.report?.gilts} />
            <MetricRow title="Tổng đàn" metricCode="total_herd" actual={report?.total_herd} accessor={(w: any) => w.report?.total_herd} />

            <GroupHeader title="B. Phối giống" />
            <MetricRow title="Số nái được phối" metricCode="actual_count" plan={breeding?.plan_count} actual={breeding?.actual_count} accessor={(w: any) => w.breeding?.actual_count} />
            <MetricRow title="Tỷ lệ phối so với chỉ tiêu" metricCode="actual_rate" actual={breeding?.actual_rate} accessor={(w: any) => w.breeding?.actual_rate} />
            <MetricRow title="Mang thai 4 tuần" metricCode="preg_4_weeks" actual={breeding?.preg_4_weeks} accessor={(w: any) => w.breeding?.preg_4_weeks} />
            <MetricRow title="Mang thai 7 tuần" metricCode="preg_7_weeks" actual={breeding?.preg_7_weeks} accessor={(w: any) => w.breeding?.preg_7_weeks} />
            <MetricRow title="Mang thai 10 tuần" metricCode="preg_10_weeks" actual={breeding?.preg_10_weeks} accessor={(w: any) => w.breeding?.preg_10_weeks} />
            <MetricRow title="Mang thai 13 tuần" metricCode="preg_13_weeks" actual={breeding?.preg_13_weeks} accessor={(w: any) => w.breeding?.preg_13_weeks} />
            <MetricRow title="Tỷ lệ đậu thai" metricCode="pregnancy_rate" actual={breeding?.pregnancy_rate} accessor={(w: any) => w.breeding?.pregnancy_rate} />

            <GroupHeader title="C. Đẻ & Sơ sinh" />
            <MetricRow title="Số nái đẻ" metricCode="farrowed_sows" actual={farrowing?.farrowed_sows} accessor={(w: any) => w.farrowing?.farrowed_sows} />
            <MetricRow title="Tổng số heo con sinh ra" metricCode="total_born" actual={farrowing?.total_born} accessor={(w: any) => w.farrowing?.total_born} />
            <MetricRow title="Chết khi sinh (%)" metricCode="stillborn_rate" actual={farrowing?.stillborn_rate} accessor={(w: any) => w.farrowing?.stillborn_rate} />
            <MetricRow title="Chết khô" metricCode="mummified_count" actual={farrowing?.mummified_count} accessor={(w: any) => w.farrowing?.mummified_count} />
            <MetricRow title="Bất thường" metricCode="abnormal_count" actual={farrowing?.abnormal_count} accessor={(w: any) => w.farrowing?.abnormal_count} />
            <MetricRow title="Tổng số con sinh sống" metricCode="liveborn_count" actual={farrowing?.liveborn_count} accessor={(w: any) => w.farrowing?.liveborn_count} />
            <MetricRow title="Số con sinh sống/nái" metricCode="liveborn_per_sow" actual={farrowing?.liveborn_per_sow} accessor={(w: any) => w.farrowing?.liveborn_per_sow} />

            <GroupHeader title="D. Heo con theo mẹ/Cai sữa" />
            <MetricRow title="Chết & loại sau sinh theo mẹ (%)" metricCode="dead_under_sow_rate" actual={mortality?.dead_under_sow_rate} accessor={(w: any) => w.mortality?.dead_under_sow_rate} />
            <MetricRow title="Chết & loại sau sinh cai sữa (%)" metricCode="dead_after_weaning_rate" actual={mortality?.dead_after_weaning_rate} accessor={(w: any) => w.mortality?.dead_after_weaning_rate} />
            <MetricRow title="Tổng heo cai sữa (Xuất)" metricCode="export_actual" plan={exportData?.export_plan} actual={exportData?.export_actual} accessor={(w: any) => w.export?.export_actual} />
            <MetricRow title="Tổng heo cai sữa/nái" metricCode="weaned_per_sow" actual={safeDivide(exportData?.export_actual, farrowing?.farrowed_sows)} accessor={(w: any) => safeDivide(w.export?.export_actual, w.farrowing?.farrowed_sows)} />
            <MetricRow title="Tỷ lệ chết & loại sau sinh (%)" metricCode="total_dead_rate" actual={mortality?.total_dead_rate} accessor={(w: any) => w.mortality?.total_dead_rate} />

            <GroupHeader title="E. Thức ăn" />
            <MetricRow title="Thức ăn heo con (kg)" metricCode="piglet_feed_total_kg" actual={report?.piglet_feed_total_kg} accessor={(w: any) => w.report?.piglet_feed_total_kg} />
            <MetricRow title="Thức ăn nái/nọc (kg)" metricCode="feed_sow_total" actual={report?.feed_sow_total} accessor={(w: any) => w.report?.feed_sow_total} />
            <MetricRow title="Khẩu phần bình quân (kg/con/ngày)" metricCode="feed_sow_avg_kg_day" actual={report?.feed_sow_avg_kg_day} accessor={(w: any) => w.report?.feed_sow_avg_kg_day} />

            <GroupHeader title="F. Hiệu suất năm" />
            <MetricRow title="Số lứa đẻ/nái/năm" metricCode="litters_per_sow_year" actual={report?.litters_per_sow_year} accessor={(w: any) => w.report?.litters_per_sow_year} />
            <MetricRow title="Số heo cai sữa/nái/năm" metricCode="weaned_per_sow_year" actual={report?.weaned_per_sow_year} accessor={(w: any) => w.report?.weaned_per_sow_year} />
            <MetricRow title="Tỷ lệ loại thải nái/hậu bị (%)" metricCode="cull_rate" actual={report?.cull_rate} accessor={(w: any) => w.report?.cull_rate} />
          </tbody>
        </table>
      </div>
    </div>
  );
}
