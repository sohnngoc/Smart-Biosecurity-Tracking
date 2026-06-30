import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import { useProductionReport } from '../../../hooks/useProductionReport';
import OverviewTab from './Tabs/OverviewTab';
import SmartInsightsTab from './Tabs/SmartInsightsTab';
import TargetActualTab from './Tabs/TargetActualTab';
import BreedingPlanTab from './Tabs/BreedingPlanTab';
import WeanedExportTab from './Tabs/WeanedExportTab';
import FeedPlanTab from './Tabs/FeedPlanTab';
import CullingTab from './Tabs/CullingTab';
import VaccineTab from './Tabs/VaccineTab';
import HerdGrowthTab from './Tabs/HerdGrowthTab';
import { cn } from '../../../lib/utils';

const TABS = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'target_actual', label: 'Kế hoạch vs Thực tế' },
  { id: 'breeding_plan', label: 'Kế hoạch phối' },
  { id: 'weaned_export', label: 'Xuất cai sữa' },
  { id: 'feed_plan', label: 'Đặt cám' },
  { id: 'culling_plan', label: 'Đăng ký loại' },
  { id: 'insights', label: 'Smart Insights' },
  { id: 'vaccine', label: 'Vaccine' },
  { id: 'herd_growth', label: 'Hậu bị & Tăng đàn' }
];

export default function SmartProductionReport() {
  const { farmCode } = useParams<{ farmCode: string }>();
  // To avoid querying 'farms' table for farmId in this demo, we will use the hardcoded one we seeded for 'FARM-NS' / Ngọc Sơn.
  // In a real app, use useFarm() hook.
  const farmId = farmCode === 'FARM-NS' ? 'f0000000-0000-0000-0000-000000000004' : 'f0000000-0000-0000-0000-000000000004';
  
  const [year] = useState(2026);
  const [week] = useState(26);
  const [activeTab, setActiveTab] = useState('target_actual');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const { data, loading, error } = useProductionReport(farmId, year, week);

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FileText className="text-emerald-600" />
            Smart Production Report
          </h1>
          <p className="text-slate-500 mt-1">Farm Ngọc Sơn - TH | Week {week}/{year} | 21/6 - 27/6</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
            <button className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md flex items-center gap-2">
              <Calendar size={16} />
              Tuần {week}/{year}
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md flex items-center gap-2">
              <Filter size={16} />
              Bộ lọc
            </button>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm flex items-center gap-2 transition-colors"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Xuất báo cáo</span>
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                <div className="py-1">
                  <button 
                    onClick={() => { setShowExportMenu(false); alert('Đang xuất báo cáo định dạng Spreadsheet (Excel)...'); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                  >
                    <FileText size={16} className="text-green-600" />
                    Spreadsheet (Excel)
                  </button>
                  <button 
                    onClick={() => { setShowExportMenu(false); alert('Đang xuất báo cáo định dạng CSV...'); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                  >
                    <Download size={16} className="text-blue-600" />
                    CSV Document
                  </button>
                  <button 
                    onClick={() => { setShowExportMenu(false); alert('Đang xuất báo cáo định dạng PDF...'); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                  >
                    <FileText size={16} className="text-red-600" />
                    PDF Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error / Loading States */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 mb-6">
          Lỗi tải dữ liệu: {error}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 overflow-hidden">
        <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-200 dark:border-slate-700">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              )}
            >
              {tab.label}
              {tab.id === 'insights' && data?.insights?.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                  {data.insights.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-slate-50/50 dark:bg-transparent rounded-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Đang tải dữ liệu báo cáo...</div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab data={data} />}
            {activeTab === 'target_actual' && <TargetActualTab data={data} farmId={farmId} year={year} week={week} />}
            {activeTab === 'breeding_plan' && <BreedingPlanTab data={data} year={year} week={week} />}
            {activeTab === 'weaned_export' && <WeanedExportTab data={data} farmId={farmId} year={year} week={week} />}
            {activeTab === 'feed_plan' && <FeedPlanTab data={data} farmId={farmId} year={year} week={week} />}
            {activeTab === 'culling_plan' && <CullingTab data={data} farmId={farmId} year={year} week={week} />}
            {activeTab === 'vaccine' && <VaccineTab data={data} farmId={farmId} year={year} week={week} />}
            {activeTab === 'herd_growth' && <HerdGrowthTab data={data} farmId={farmId} year={year} week={week} />}
            {activeTab === 'insights' && <SmartInsightsTab insights={data?.insights || []} />}
            {activeTab !== 'overview' && activeTab !== 'insights' && activeTab !== 'target_actual' && activeTab !== 'breeding_plan' && activeTab !== 'weaned_export' && activeTab !== 'feed_plan' && activeTab !== 'culling_plan' && activeTab !== 'vaccine' && activeTab !== 'herd_growth' && (
              <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <FileText className="mx-auto text-slate-300 mb-3" size={48} />
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">Tính năng đang phát triển</h3>
                <p className="text-slate-500 mt-1">Tab "{TABS.find(t => t.id === activeTab)?.label}" đang được xây dựng.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
