import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import { FileText, ArrowLeft, Plus, Eye } from 'lucide-react';
import HandoverForm from './HandoverForm';

export default function PigletHandover() {
  const { farmId, farmCode } = useOutletContext<{ farmId: string, farmCode: string }>();
  const navigate = useNavigate();

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    fetchRefData();
  }, [farmId]);

  const fetchRefData = async () => {
    const { data } = await supabase.from('employees').select('*').eq('farm_id', farmId);
    if (data) setEmployees(data);
  };

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('piglet_handovers')
      .select('*, employees!piglet_handovers_receiver_engineer_id_fkey(full_name)')
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false });
    
    if (data) setRecords(data);
    setLoading(false);
  };

  const generateMockData = async () => {
    const engineerId = employees[0]?.id || null;
    
    const mockIds = [
      { 
        status: 'Approved', qty: 250, weight: 1400, docUrl: 'https://images.unsplash.com/photo-1568205612837-017257d2310a?w=400&q=80',
        vaccines: [{name: 'Amlistin', date: '2026-06-15', week: 2}, {name: 'PRRS', date: '2026-06-22', week: 3}, {name: 'SFV2', date: '2026-06-29', week: 4}],
        ages: [{birth_week: 'Tuần 22', age_week: 4, qty: 150}, {birth_week: 'Tuần 23', age_week: 3, qty: 100}]
      },
      { 
        status: 'Submitted', qty: 300, weight: 1550, docUrl: 'https://images.unsplash.com/photo-1568205612837-017257d2310a?w=400&q=80',
        vaccines: [{name: 'Circo + Myco', date: '2026-06-20', week: 3}],
        ages: [{birth_week: 'Tuần 23', age_week: 3, qty: 300}]
      },
      { 
        status: 'Draft', qty: 0, weight: 0, docUrl: '',
        vaccines: [], ages: []
      }
    ];
    
    for (let m of mockIds) {
      const isOk = m.qty > 0;
      await supabase.from('piglet_handovers').insert({
        farm_id: farmId,
        status: m.status,
        document_no: `BG-${Math.floor(Math.random() * 100000)}`,
        source_farm_name: 'Trại Nái 1',
        dest_farm_name: 'Trại Hậu Bị 2',
        dest_farm_type: 'Hậu bị',
        receiver_engineer_id: engineerId,
        driver_name: 'Nguyễn Văn Xe',
        vehicle_plate: '51C-123.45',
        vehicle_sanitized: isOk,
        total_qty: m.qty,
        male_qty: Math.floor(m.qty / 2),
        female_qty: m.qty - Math.floor(m.qty / 2),
        total_weight: m.weight,
        avg_weight: isOk ? Number((m.weight / m.qty).toFixed(2)) : 0,
        vaccine_data: m.vaccines,
        age_data: m.ages,
        document_photo_url: m.docUrl
      });
    }
    fetchData();
  };

  const getStatusColor = (s: string) => {
    if (s === 'Approved') return 'bg-emerald-100 text-emerald-700';
    if (s === 'Draft') return 'bg-slate-100 text-slate-700';
    if (s === 'Submitted') return 'bg-blue-100 text-blue-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto min-h-screen">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/trai/${farmCode}/piglet-transfer`)} className="p-2 hover:bg-slate-100 rounded-full transition">
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="text-blue-600" />
              Bàn giao heo con
            </h1>
            <p className="text-slate-500 mt-1">Biên bản giao nhận heo con từ trại nái</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={generateMockData} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 bg-white text-slate-700 font-medium text-sm">
            Tạo Mock Data
          </button>
          <button onClick={() => setSelectedId('new')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center text-sm font-medium">
            <Plus size={16} className="mr-2" /> Tạo Biên Bản
          </button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-slate-200 rounded"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          Chưa có biên bản bàn giao nào. Bấm "Tạo Mock Data" để thử nghiệm.
        </div>
      ) : (
        <div className="grid gap-4">
          {records.map(r => (
            <div key={r.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-300 transition-colors cursor-pointer" onClick={() => setSelectedId(r.id)}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg flex items-center justify-center shrink-0 ${r.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{r.document_no || 'Chưa có mã'}</h3>
                  <p className="text-sm text-slate-500">Từ: {r.source_farm_name || 'N/A'} ➔ Đến: {r.dest_farm_name || 'N/A'}</p>
                  <p className="text-sm text-slate-500">Số lượng: <strong>{r.total_qty} con</strong> ({r.total_weight} kg)</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(r.status)}`}>
                  {r.status}
                </span>
                <button className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                  <Eye size={16} className="mr-1" /> Chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedId && (
        <HandoverForm 
          handoverId={selectedId} 
          farmId={farmId}
          employees={employees}
          onClose={() => setSelectedId(null)}
          onSave={() => {
            setSelectedId(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
