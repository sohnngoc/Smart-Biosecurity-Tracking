import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import { LayoutDashboard, Leaf, Database, Download } from 'lucide-react';
import DashboardTab from './Tabs/DashboardTab';
import EFLibraryTab from './Tabs/EmissionFactorLibraryTab'; // cache bust
import ExportTab from './Tabs/ReportExportTab'; // cache bust

export default function CarbonMRV() {
  const { farmCode } = useParams();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [farmData, setFarmData] = useState<any>(null);
  
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      // Ensure we get farm_id based on farmCode. Since farmCode is string, if it matches ID, great, else we fallback.
      // Usually, in BioTrace, farmCode is 'FARM-002'. We need the UUID from `farms` table.
      
      const { data: farms } = await supabase.from('farms').select('*');
      // Just taking the first for simplicity in UI, or matching by ID/name.
      let matchedFarm = farms?.find(f => f.farm_code === farmCode || f.id === farmCode);
      
      if (!matchedFarm && farms && farms.length > 0) {
        matchedFarm = farms[0];
      }
      
      if (!matchedFarm) {
        // Mock fallback if DB is totally empty
        matchedFarm = {
          id: 'mock-farm-id',
          name: 'Trại Mô Phỏng (Demo)',
          farm_code: farmCode || 'FARM-DEMO'
        };
      }
      
      setFarmData(matchedFarm);
      setLoading(false);
    };
    initData();
  }, [farmCode]);

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu Carbon MRV...</div>;
  if (!farmData) return <div className="p-8 text-center text-red-500">Không tìm thấy dữ liệu Trại!</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center">
              <Leaf size={14} className="mr-1" />
              Sustainability Module
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Carbon MRV Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Giám sát, báo cáo và mô phỏng phát thải KNK tại <strong className="text-emerald-700">{farmData.name}</strong></p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex flex-wrap gap-1">
        <TabButton id="dashboard" icon={<LayoutDashboard size={18} />} label="Tổng quan Phát thải" active={activeTab} onClick={setActiveTab} />
        <TabButton id="ef_library" icon={<Database size={18} />} label="Thư viện Hệ số (EF)" active={activeTab} onClick={setActiveTab} />
        <TabButton id="export" icon={<Download size={18} />} label="Xuất Báo cáo" active={activeTab} onClick={setActiveTab} />
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'dashboard' && <DashboardTab farmId={farmData.id} />}
        {activeTab === 'ef_library' && <EFLibraryTab />}
        {activeTab === 'export' && <ExportTab farmId={farmData.id} />}
      </div>
    </div>
  );
}

function TabButton({ id, icon, label, active, onClick }: any) {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
        isActive 
          ? 'bg-slate-900 text-white shadow-md' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
