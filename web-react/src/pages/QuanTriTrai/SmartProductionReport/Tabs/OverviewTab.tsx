import { Users, PiggyBank, Baby, Box, ArrowRight, Skull, LineChart, ShieldAlert } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { calculateStatus } from '../../../../utils/reportUtils';

export default function OverviewTab({ data }: { data: any }) {
  if (!data?.report) return <div className="p-4 text-slate-500">Đang tải dữ liệu...</div>;

  const { report, breeding, farrowing, mortality, export: exportData } = data;

  const KPICard = ({ title, value, unit, subtitle, icon, status }: any) => {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</div>
          <div className={cn("p-1.5 rounded-lg", 
            status === 'good' ? 'bg-emerald-100 text-emerald-600' :
            status === 'warning' ? 'bg-amber-100 text-amber-600' :
            status === 'critical' ? 'bg-red-100 text-red-600' :
            'bg-slate-100 text-slate-600'
          )}>
            {icon}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold text-slate-800 dark:text-white">{value}</div>
          {unit && <div className="text-sm font-medium text-slate-500">{unit}</div>}
        </div>
        {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Tổng đàn */}
      <div>
        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
          <PiggyBank size={18} className="text-blue-500" />
          Quy mô đàn
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <KPICard title="Tổng đàn" value={report.total_herd} icon={<Users size={16} />} />
          <KPICard title="Nái sinh sản" value={report.productive_sows} icon={<Baby size={16} />} />
          <KPICard title="Nái hậu bị" value={report.gilts} icon={<Box size={16} />} />
          <KPICard title="Nọc" value={report.boars} icon={<LineChart size={16} />} />
          <KPICard title="Lô 888" value={report.batch_888_total} icon={<ShieldAlert size={16} />} />
          <KPICard title="Cám nái bình quân" value={report.feed_sow_avg_kg_day} unit="kg/con/ngày" 
            status={calculateStatus(report.feed_sow_avg_kg_day, 2.55, 'lower_is_better')}
            icon={<ArrowRight size={16} />} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Phối giống */}
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <LineChart size={18} className="text-emerald-500" />
            Phối giống
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <KPICard title="Phối mục tiêu" value={breeding?.target_count} icon={<CheckCircleIcon />} />
            <KPICard title="Kế hoạch tuần" value={breeding?.plan_count} icon={<CheckCircleIcon />} />
            <KPICard title="Thực tế phối" value={breeding?.actual_count} 
              subtitle={`Từ cai sữa: ${breeding?.from_weaned_sows} | Từ hậu bị: ${breeding?.from_gilts}`}
              status={calculateStatus(breeding?.actual_count, breeding?.target_count, 'higher_is_better')} 
              icon={<CheckCircleIcon />} />
            <KPICard title="Tỷ lệ phối" value={`${breeding?.actual_rate}%`} icon={<CheckCircleIcon />} />
          </div>
        </div>

        {/* 3. Đẻ & Sơ sinh */}
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <Baby size={18} className="text-purple-500" />
            Đẻ & Sơ sinh
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <KPICard title="Nái đẻ" value={farrowing?.farrowed_sows} icon={<Baby size={16} />} />
            <KPICard title="Tổng sơ sinh" value={farrowing?.total_born} 
              subtitle={`Bình quân: ${farrowing?.born_per_sow} con/nái`}
              icon={<Baby size={16} />} />
            <KPICard title="Số con sống" value={farrowing?.liveborn_count} 
              subtitle={`Bình quân: ${farrowing?.liveborn_per_sow} con/nái`}
              icon={<Baby size={16} />} />
            <KPICard title="Chết khi sinh" value={`${farrowing?.stillborn_rate}%`} 
              subtitle={`Số lượng: ${farrowing?.stillborn_count}`}
              status={calculateStatus(farrowing?.stillborn_rate, 10, 'lower_is_better')} 
              icon={<Skull size={16} />} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 4. Cai sữa & Xuất */}
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <Box size={18} className="text-amber-500" />
            Xuất Heo Cai Sữa
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <KPICard title="Kế hoạch xuất" value={exportData?.export_plan} icon={<ArrowRight size={16} />} />
            <KPICard title="Thực tế xuất" value={exportData?.export_actual} 
              status={calculateStatus(exportData?.export_actual, exportData?.export_plan, 'higher_is_better')} 
              icon={<ArrowRight size={16} />} />
            <KPICard title="Trọng lượng TB" value={exportData?.avg_weight} unit="kg/con" icon={<ArrowRight size={16} />} />
            <KPICard title="Chênh lệch" value={exportData?.export_balance} icon={<ArrowRight size={16} />} />
          </div>
        </div>

        {/* 5. Chết sau sinh */}
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <Skull size={18} className="text-red-500" />
            Chết & Loại
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <KPICard title="Chết theo mẹ" value={`${mortality?.dead_under_sow_rate}%`} 
              subtitle={`${mortality?.dead_under_sow} con`} icon={<Skull size={16} />} />
            <KPICard title="Chết sau cai sữa" value={`${mortality?.dead_after_weaning_rate}%`} 
              subtitle={`${mortality?.dead_after_weaning} con`} icon={<Skull size={16} />} />
            <KPICard title="Tổng chết/loại" value={`${mortality?.total_dead_rate}%`} 
              subtitle={`${mortality?.total_dead} con`} 
              status={calculateStatus(mortality?.total_dead_rate, 5, 'lower_is_better')} 
              icon={<Skull size={16} />} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
