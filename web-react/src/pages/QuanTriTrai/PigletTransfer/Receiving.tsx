import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import { CheckSquare, ArrowLeft, Plus, Eye, AlertTriangle } from 'lucide-react';
import ReceivingForm from './ReceivingForm';

export default function PigletReceiving() {
  const { farmId, farmCode } = useOutletContext<{ farmId: string, farmCode: string }>();
  const navigate = useNavigate();

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [employees, setEmployees] = useState<any[]>([]);
  const [barns, setBarns] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    fetchRefData();
  }, [farmId]);

  const fetchRefData = async () => {
    const [eRes, bRes] = await Promise.all([
      supabase.from('employees').select('*').eq('farm_id', farmId),
      supabase.from('barns').select('*').eq('farm_id', farmId)
    ]);
    if (eRes.data) setEmployees(eRes.data);
    if (bRes.data) setBarns(bRes.data);
  };

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('piglet_receivings')
      .select('*, piglet_handovers(document_no)')
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false });
    
    if (data) setRecords(data);
    setLoading(false);
  };

  const generateMockData = async () => {
    // We assume there's at least one Handover to link to, if not we leave it null
    const hdRes = await supabase.from('piglet_handovers').select('id, document_no, total_qty').eq('farm_id', farmId).limit(3);
    const hds = hdRes.data || [];

    const mockIds = [
      { 
        status: 'Approved', actual: 250, expected: 250, claim: false,
        handover: hds[0] || null
      },
      { 
        status: 'Submitted', actual: 298, expected: 300, claim: true, type: 'Sai lệch số lượng',
        handover: hds[1] || null
      },
      { 
        status: 'Draft', actual: 300, expected: 300, claim: true, type: 'Sự cố sức khoẻ / Chất lượng',
        handover: hds[2] || null
      }
    ];
    
    for (let m of mockIds) {
      const hd = m.handover;
      const expected = hd ? hd.total_qty : m.expected;
      const actual = hd ? (hd.total_qty === 300 ? 298 : hd.total_qty) : m.actual; // create diff if qty was 300

      let d = new Date();
      if (m.type === 'Sai lệch số lượng') d.setHours(d.getHours() + 24);
      else d.setHours(d.getHours() + 72);

      await supabase.from('piglet_receivings').insert({
        farm_id: farmId,
        status: m.status,
        handover_id: hd ? hd.id : null,
        expected_qty: expected,
        actual_qty: actual,
        surplus_qty: Math.max(0, actual - expected),
        deficit_qty: Math.max(0, expected - actual),
        has_claim: m.claim,
        claim_type: m.type,
        claim_deadline: m.claim ? d.toISOString() : null,
        is_accepted: true
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
              <CheckSquare className="text-emerald-600" />
              Nhận heo cai sữa
            </h1>
            <p className="text-slate-500 mt-1">Đối chiếu số lượng và đánh giá tình trạng heo lúc nhận</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={generateMockData} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 bg-white text-slate-700 font-medium text-sm">
            Tạo Mock Data
          </button>
          <button onClick={() => setSelectedId('new')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center text-sm font-medium">
            <Plus size={16} className="mr-2" /> Tạo phiếu Nhận
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
          Chưa có phiếu nhận heo nào. Bấm "Tạo Mock Data" để sinh dữ liệu ảo.
        </div>
      ) : (
        <div className="grid gap-4">
          {records.map(r => (
            <div key={r.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-emerald-300 transition-colors cursor-pointer" onClick={() => setSelectedId(r.id)}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg flex items-center justify-center shrink-0 ${r.has_claim ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {r.has_claim ? <AlertTriangle size={24} /> : <CheckSquare size={24} />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Phiếu nhận từ: {r.piglet_handovers?.document_no || 'Không xác định'}</h3>
                  <p className="text-sm text-slate-500">Thực nhận: <strong>{r.actual_qty} con</strong> {r.expected_qty && `(Giao: ${r.expected_qty} con)`}</p>
                  {r.has_claim && <p className="text-sm text-amber-600 mt-1 font-medium">⚠ Có Claim: {r.claim_type}</p>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(r.status)}`}>
                  {r.status}
                </span>
                <button className="flex items-center text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                  <Eye size={16} className="mr-1" /> Chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedId && (
        <ReceivingForm 
          receivingId={selectedId} 
          farmId={farmId}
          employees={employees}
          barns={barns}
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
