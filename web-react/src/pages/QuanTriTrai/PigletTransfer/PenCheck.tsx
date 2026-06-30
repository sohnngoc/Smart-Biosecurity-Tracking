import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import { CheckSquare, ArrowLeft, Plus, Eye } from 'lucide-react';
import PenCheckForm from './PenCheckForm';

export default function PigletPenCheck() {
  const { farmId, farmCode } = useOutletContext<{ farmId: string, farmCode: string }>();
  const navigate = useNavigate();

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for form modal
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Reference data
  const [barns, setBarns] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    fetchRefData();
  }, [farmId]);

  const fetchRefData = async () => {
    const [bRes, eRes] = await Promise.all([
      supabase.from('barns').select('*').eq('farm_id', farmId),
      supabase.from('employees').select('*').eq('farm_id', farmId)
    ]);
    if (bRes.data) setBarns(bRes.data);
    if (eRes.data) setEmployees(eRes.data);
  };

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('pen_checks')
      .select('*, barns(barn_name), employees!pen_checks_inspector_id_fkey(full_name)')
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false });
    
    if (data) setRecords(data);
    setLoading(false);
  };

  const generateMockData = async () => {
    const mockIds = [
      { status: 'Approved', ready: true, issues: '' },
      { status: 'Submitted', ready: null, issues: '' },
      { status: 'Need Recheck', ready: false, issues: 'Máng ăn chưa sạch' },
      { status: 'Draft', ready: null, issues: '' }
    ];
    
    for (let m of mockIds) {
      await supabase.from('pen_checks').insert({
        farm_id: farmId,
        barn_id: barns[0]?.id || null,
        inspector_id: employees[0]?.id || null,
        status: m.status,
        pen_code: `PEN-${Math.floor(Math.random() * 100)}`,
        checklist_data: {
          is_washed: m.ready !== false,
          is_disinfected: m.ready !== false,
          water_system_ok: m.ready !== false,
          fan_system_ok: m.ready !== false,
          temp_ok: m.ready !== false,
        },
        is_ready: m.ready,
        issues_found: m.issues
      });
    }
    fetchData();
  };

  const getStatusColor = (s: string) => {
    if (s === 'Approved') return 'bg-emerald-100 text-emerald-700';
    if (s === 'Rejected') return 'bg-red-100 text-red-700';
    if (['Draft', 'Assigned'].includes(s)) return 'bg-slate-100 text-slate-700';
    if (['Submitted', 'Vet Reviewed'].includes(s)) return 'bg-blue-100 text-blue-700';
    if (s === 'Need Recheck') return 'bg-amber-100 text-amber-700';
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
              <CheckSquare className="text-emerald-600" />
              Danh sách Kiểm tra chuồng
            </h1>
            <p className="text-slate-500 mt-1">Quản lý phiếu kiểm tra trước khi nhận heo cai sữa</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={generateMockData} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 bg-white text-slate-700 font-medium text-sm">
            Tạo Mock Data
          </button>
          <button onClick={() => setSelectedId('new')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center text-sm font-medium">
            <Plus size={16} className="mr-2" /> Tạo phiếu kiểm tra
          </button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-20 bg-slate-200 rounded"></div>
            <div className="h-20 bg-slate-200 rounded"></div>
          </div>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          Không có phiếu kiểm tra chuồng nào. Hãy bấm "Tạo Mock Data" hoặc "Tạo phiếu kiểm tra" để thử nghiệm.
        </div>
      ) : (
        <div className="grid gap-4">
          {records.map(r => (
            <div key={r.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-emerald-300 transition-colors cursor-pointer" onClick={() => setSelectedId(r.id)}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg flex items-center justify-center shrink-0 ${r.is_ready ? 'bg-emerald-50 text-emerald-600' : r.is_ready === false ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
                  <CheckSquare size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Chuồng: {r.barns?.barn_name || 'N/A'} - Ô: {r.pen_code || 'N/A'}</h3>
                  <p className="text-sm text-slate-500">Người thực hiện: {r.employees?.full_name || 'Chưa phân công'}</p>
                  <p className="text-sm text-slate-500">Ngày tạo: {new Date(r.created_at).toLocaleString('vi-VN')}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(r.status)}`}>
                  {r.status}
                </span>
                <button 
                  className="flex items-center text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  <Eye size={16} className="mr-1" /> Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedId && (
        <PenCheckForm 
          penCheckId={selectedId} 
          farmId={farmId}
          barns={barns}
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
