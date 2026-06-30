import { AlertTriangle, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export default function SmartInsightsTab({ insights }: { insights: any[] }) {
  if (!insights || insights.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        Không có cảnh báo thông minh nào cho tuần này.
      </div>
    );
  }

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="text-red-500" size={24} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={24} />;
      case 'good': return <CheckCircle2 className="text-emerald-500" size={24} />;
      default: return <Info className="text-blue-500" size={24} />;
    }
  };

  const getBgClass = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/50';
      case 'warning': return 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/50';
      case 'good': return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/50';
      default: return 'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/50';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
        Cảnh Báo Thông Minh
      </h3>
      <div className="grid gap-4">
        {insights.map((insight, idx) => (
          <div 
            key={idx} 
            className={cn("p-4 rounded-xl border flex gap-4 items-start transition-shadow hover:shadow-md", getBgClass(insight.severity))}
          >
            <div className="mt-1">
              {getIcon(insight.severity)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-100">{insight.title}</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-medium capitalize">
                  {insight.category}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                {insight.description}
              </p>
              {insight.recommended_action && (
                <div className="mt-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg text-sm text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50">
                  <span className="font-semibold block mb-1">Đề xuất hành động:</span>
                  {insight.recommended_action}
                </div>
              )}
            </div>
            {insight.recommended_action && (
              <div className="shrink-0">
                <button className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-emerald-600 transition-colors">
                  Tạo Task
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
