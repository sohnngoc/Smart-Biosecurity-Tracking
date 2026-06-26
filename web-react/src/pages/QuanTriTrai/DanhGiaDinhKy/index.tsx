import { useState, useEffect } from 'react';
import { useParams , useOutletContext} from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import TongHopTab from './Tabs/TongHopTab';
import FormTab from './Tabs/FormTab';
import ChecklistTab from './Tabs/ChecklistTab';
import KhacPhucTab from './Tabs/KhacPhucTab';
import LichSuTab from './Tabs/LichSuTab';
import CreatePeriodModal from './Tabs/CreatePeriodModal';
import { PlusCircle } from 'lucide-react';

export default function DanhGiaDinhKy() {
  const { farmId } = useOutletContext<{ farmId: string }>();
  const [activeTab, setActiveTab] = useState('tong_hop');
  const [loading, setLoading] = useState(true);
  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchPeriods = async () => {
    const { data } = await supabase
      .from('assessment_periods')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data && data.length > 0) {
      setPeriods(data);
      const active = data.find(p => p.is_active);
      if (active) {
        setSelectedPeriodId(active.id);
      } else {
        setSelectedPeriodId(data[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPeriods();
  }, [farmId]);

  const tabs = [
    { id: 'tong_hop', name: 'Tổng hợp' },
    { id: 'phan_cung', name: 'Phần cứng' },
    { id: 'phan_mem', name: 'Phần mềm' },
    { id: 'checklist', name: 'CheckLIST NÁI-HB' },
    { id: 'lich_su', name: 'Lịch sử đánh giá' },
    { id: 'khac_phuc', name: 'Hành động khắc phục' },
  ];

  if (loading) return <div className="p-4 text-center">Đang tải...</div>;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b overflow-x-auto justify-between items-center pr-4">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id 
                  ? 'border-b-2 border-blue-600 text-blue-700 bg-blue-50/50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-3 ml-4">
          <select 
            className="border-gray-300 rounded-lg text-sm bg-gray-50 font-bold focus:ring-blue-500 text-blue-800 p-2"
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
          >
            {periods.map(p => (
              <option key={p.id} value={p.id}>{p.period_name} {p.is_active ? '(Active)' : ''}</option>
            ))}
          </select>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-lg font-medium transition whitespace-nowrap"
          >
            <PlusCircle size={16} className="mr-1" />
            Kỳ Đánh Giá Mới
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'tong_hop' && <TongHopTab farmId={farmId} />}
        {activeTab === 'phan_cung' && <FormTab formCode="HARDWARE" farmId={farmId} periodId={selectedPeriodId} />}
        {activeTab === 'phan_mem' && <FormTab formCode="SOFTWARE" farmId={farmId} periodId={selectedPeriodId} />}
        {activeTab === 'checklist' && <ChecklistTab formCode="CHECKLIST_NAI_HB" farmId={farmId} periodId={selectedPeriodId} />}
        {activeTab === 'lich_su' && <LichSuTab farmId={farmId} />}
        {activeTab === 'khac_phuc' && <KhacPhucTab farmId={farmId} />}
      </div>

      <CreatePeriodModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchPeriods();
        }}
      />
    </div>
  );
}
