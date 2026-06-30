import { useState, useEffect } from 'react';
import { X, Camera, AlertTriangle, CheckSquare, FileText, AlertCircle, Calendar } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';

export default function ReceivingForm({ receivingId, onClose, onSave, farmId, employees, barns }: any) {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>({
    status: 'Draft',
    actual_qty: 0,
    expected_qty: 0,
    has_claim: false,
    is_accepted: true,
  });

  const [handoverData, setHandoverData] = useState<any>(null);

  useEffect(() => {
    if (receivingId === 'new') {
      // Mock loading an existing handover for a new receiving
      fetchAvailableHandovers();
    } else {
      fetchData();
    }
  }, [receivingId]);

  const fetchAvailableHandovers = async () => {
    const { data } = await supabase.from('piglet_handovers').select('*').eq('farm_id', farmId).eq('status', 'Approved').limit(1);
    const hd = data && data.length > 0 ? data[0] : null;
    
    setHandoverData(hd);
    setFormData({
      farm_id: farmId,
      status: 'Draft',
      handover_id: hd?.id || null,
      expected_qty: hd?.total_qty || 0,
      actual_qty: hd?.total_qty || 0,
      male_qty: hd?.male_qty || 0,
      female_qty: hd?.female_qty || 0,
      total_weight: hd?.total_weight || 0,
      avg_weight: hd?.avg_weight || 0,
      arrival_time: new Date().toISOString(),
      dead_qty: 0, cull_qty: 0, sick_qty: 0,
      diarrhea_qty: 0, respiratory_qty: 0, dehydration_qty: 0, injured_qty: 0,
      is_accepted: true,
      has_claim: false,
    });
    setLoading(false);
  };

  const fetchData = async () => {
    const { data } = await supabase.from('piglet_receivings').select('*, piglet_handovers(*)').eq('id', receivingId).single();
    if (data) {
      setHandoverData(data.piglet_handovers);
      setFormData(data);
    }
    setLoading(false);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => {
      const next = { ...prev, [field]: value };
      
      // Auto-calculate differences
      if (['actual_qty', 'expected_qty'].includes(field)) {
        const actual = Number(next.actual_qty || 0);
        const expected = Number(next.expected_qty || 0);
        next.surplus_qty = Math.max(0, actual - expected);
        next.deficit_qty = Math.max(0, expected - actual);
        
        if (actual !== expected) {
          next.has_claim = true;
          next.claim_type = 'Sai lệch số lượng';
          const d = new Date(); d.setHours(d.getHours() + 24);
          next.claim_deadline = d.toISOString();
        } else {
          next.has_claim = false;
        }
      }

      // Auto-calculate avg weight
      if (['actual_qty', 'total_weight'].includes(field)) {
        const qty = Number(next.actual_qty || 0);
        const w = Number(next.total_weight || 0);
        if (qty > 0) next.avg_weight = Number((w / qty).toFixed(2));
      }
      
      // Health issues -> 72h claim
      const hasHealthIssue = ['dead_qty', 'cull_qty', 'sick_qty', 'diarrhea_qty', 'respiratory_qty', 'dehydration_qty', 'injured_qty'].includes(field) && Number(value) > 0;
      if (hasHealthIssue && !next.has_claim) {
        next.has_claim = true;
        next.claim_type = 'Sự cố sức khoẻ / Chất lượng';
        const d = new Date(); d.setHours(d.getHours() + 72);
        next.claim_deadline = d.toISOString();
      }

      return next;
    });
  };

  const isDiscrepancy = formData.actual_qty !== formData.expected_qty;
  const hasHealthIssue = (formData.dead_qty + formData.cull_qty + formData.sick_qty + formData.diarrhea_qty + formData.respiratory_qty + formData.injured_qty) > 0;
  const missingEvidence = formData.has_claim && (!formData.evidence_photos || formData.evidence_photos.length === 0);

  const handleSave = async (newStatus?: string) => {
    let finalStatus = newStatus || formData.status;
    
    if (finalStatus === 'Submitted') {
      if (missingEvidence) {
        alert('Lỗi: Bạn đã mở Khiếu nại (Claim) nhưng chưa tải lên ảnh bằng chứng (Evidence Photos)!');
        return;
      }
    }

    const payload = { ...formData, status: finalStatus };
    delete payload.piglet_handovers; // remove joined data
    
    if (receivingId === 'new') {
      const { data } = await supabase.from('piglet_receivings').insert(payload).select().single();
      if (data) onSave(data.id);
    } else {
      await supabase.from('piglet_receivings').update(payload).eq('id', receivingId);
      onSave();
    }
  };

  if (loading) return <div className="p-8 text-center">Đang tải...</div>;

  const sectionHeaderClass = "text-lg font-bold text-slate-800 mb-4 pb-2 border-b flex items-center gap-2";

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <CheckSquare className="text-emerald-600" />
              Biên bản Nhận Heo con
            </h2>
            {handoverData && <p className="text-sm text-slate-500">Từ phiếu xuất: {handoverData.document_no}</p>}
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border
              ${formData.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ''}
              ${['Draft'].includes(formData.status) ? 'bg-slate-100 text-slate-700 border-slate-200' : ''}
              ${['Submitted'].includes(formData.status) ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
            `}>
              {formData.status}
            </span>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg"><X size={20} /></button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-8 bg-slate-50/50">
          
          {/* A. Info */}
          <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className={sectionHeaderClass}>Thông tin Tiếp nhận</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="text-sm text-slate-600">Ngày giờ xe đến</label><input type="datetime-local" value={formData.arrival_time ? new Date(formData.arrival_time).toISOString().slice(0,16) : ''} onChange={e => handleChange('arrival_time', e.target.value)} className="w-full p-2 border rounded bg-slate-50 mt-1" /></div>
              <div>
                <label className="text-sm text-slate-600">Người nhận</label>
                <select value={formData.receiver_id || ''} onChange={e => handleChange('receiver_id', e.target.value)} className="w-full p-2 border rounded bg-slate-50 mt-1">
                  <option value="">-- Chọn --</option>
                  {employees.map((emp: any) => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-600">Khu/Chuồng nhận</label>
                <select value={formData.barn_id || ''} onChange={e => handleChange('barn_id', e.target.value)} className="w-full p-2 border rounded bg-slate-50 mt-1">
                  <option value="">-- Chọn --</option>
                  {barns.map((b: any) => <option key={b.id} value={b.id}>{b.barn_name}</option>)}
                </select>
              </div>
            </div>
            {handoverData && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800 flex items-center gap-4">
                <div><strong>Lái xe:</strong> {handoverData.driver_name}</div>
                <div><strong>Biển số:</strong> {handoverData.vehicle_plate}</div>
                <div><strong>Trại xuất:</strong> {handoverData.source_farm_name}</div>
              </div>
            )}
          </section>

          {/* B & C. Quantities */}
          <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className={sectionHeaderClass}>Số lượng & Đối chiếu</h3>
            
            {isDiscrepancy && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div>
                  <strong>CẢNH BÁO SAI LỆCH SỐ LƯỢNG:</strong> Số nhận ({formData.actual_qty}) khác số giao ({formData.expected_qty}). 
                  <br/>Hệ thống đã tự động tạo Claim (Deadline 24h).
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div><label className="text-sm text-slate-600">Số giao (Phiếu)</label><input type="number" readOnly value={formData.expected_qty || 0} className="w-full p-2 border bg-slate-100 rounded text-slate-500 font-bold mt-1" /></div>
              <div><label className="text-sm text-slate-800 font-bold">Số THỰC NHẬN</label><input type="number" value={formData.actual_qty || 0} onChange={e => handleChange('actual_qty', e.target.value)} className="w-full p-2 border-2 border-emerald-400 bg-emerald-50 rounded font-bold text-lg mt-1" /></div>
              <div><label className="text-sm text-slate-600">Số lượng Đực</label><input type="number" value={formData.male_qty || 0} onChange={e => handleChange('male_qty', e.target.value)} className="w-full p-2 border rounded bg-slate-50 mt-1" /></div>
              <div><label className="text-sm text-slate-600">Số lượng Cái</label><input type="number" value={formData.female_qty || 0} onChange={e => handleChange('female_qty', e.target.value)} className="w-full p-2 border rounded bg-slate-50 mt-1" /></div>
              <div><label className="text-sm text-slate-600">Tổng TL (kg)</label><input type="number" value={formData.total_weight || 0} onChange={e => handleChange('total_weight', e.target.value)} className="w-full p-2 border rounded bg-slate-50 mt-1" /></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-4">
              <div className="col-span-2 md:col-span-4"><h4 className="font-semibold text-slate-700">Tình trạng Sức khỏe (Lúc nhận)</h4></div>
              <div><label className="text-xs text-slate-500">Số heo chết trên xe</label><input type="number" value={formData.dead_qty || 0} onChange={e => handleChange('dead_qty', e.target.value)} className="w-full p-1.5 border border-red-200 bg-red-50 rounded mt-1" /></div>
              <div><label className="text-xs text-slate-500">Heo loại ngay</label><input type="number" value={formData.cull_qty || 0} onChange={e => handleChange('cull_qty', e.target.value)} className="w-full p-1.5 border border-amber-200 bg-amber-50 rounded mt-1" /></div>
              <div><label className="text-xs text-slate-500">Tiêu chảy</label><input type="number" value={formData.diarrhea_qty || 0} onChange={e => handleChange('diarrhea_qty', e.target.value)} className="w-full p-1.5 border rounded mt-1" /></div>
              <div><label className="text-xs text-slate-500">Bị thương/Què</label><input type="number" value={formData.injured_qty || 0} onChange={e => handleChange('injured_qty', e.target.value)} className="w-full p-1.5 border rounded mt-1" /></div>
            </div>
            
            {(Number(formData.cull_qty) > 0) && (
              <div className="mt-3">
                <label className="text-sm text-slate-600">Lý do heo loại</label>
                <input type="text" value={formData.cull_reason || ''} onChange={e => handleChange('cull_reason', e.target.value)} className="w-full p-2 border rounded mt-1 bg-slate-50" placeholder="Còi cọc, dị tật..." />
              </div>
            )}
          </section>

          {/* D. Quality Check */}
          <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className={sectionHeaderClass}>Đánh giá Chất lượng</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-sm text-slate-600">Thể trọng</label>
                <select value={formData.physique_score || ''} onChange={e => handleChange('physique_score', e.target.value)} className="w-full p-2 border rounded mt-1">
                  <option value="Đạt">Đạt</option><option value="Khá">Khá</option><option value="Kém">Kém</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-600">Sức khoẻ chung</label>
                <select value={formData.health_score || ''} onChange={e => handleChange('health_score', e.target.value)} className="w-full p-2 border rounded mt-1">
                  <option value="Tốt">Tốt</option><option value="Bệnh nhẹ">Bệnh nhẹ</option><option value="Kém">Kém</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-600">Độ đồng đều</label>
                <select value={formData.uniformity_score || ''} onChange={e => handleChange('uniformity_score', e.target.value)} className="w-full p-2 border rounded mt-1">
                  <option value="Cao">Cao</option><option value="Trung bình">Trung bình</option><option value="Thấp">Thấp</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className={`flex items-center gap-2 p-2 border rounded w-full cursor-pointer ${formData.is_accepted ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  <input type="checkbox" checked={formData.is_accepted || false} onChange={e => handleChange('is_accepted', e.target.checked)} className="w-5 h-5" />
                  <span className="text-sm font-bold">{formData.is_accepted ? 'ĐẠT TIÊU CHUẨN NHẬN' : 'KHÔNG ĐẠT (CÁCH LY)'}</span>
                </label>
              </div>
            </div>
          </section>

          {/* E. Claim */}
          <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between border-b pb-2 mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                Khiếu nại / Sự cố (Claim)
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-slate-600">Có phát sinh Claim?</span>
                <input type="checkbox" checked={formData.has_claim || false} onChange={e => handleChange('has_claim', e.target.checked)} className="w-5 h-5 text-blue-600" />
              </label>
            </div>
            
            {formData.has_claim ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-slate-600">Loại sự cố</label>
                    <select value={formData.claim_type || ''} onChange={e => handleChange('claim_type', e.target.value)} className="w-full p-2 border rounded mt-1 bg-amber-50">
                      <option value="Sai lệch số lượng">Sai lệch số lượng</option>
                      <option value="Sai lệch trọng lượng">Sai lệch trọng lượng</option>
                      <option value="Sự cố sức khoẻ / Chất lượng">Sự cố sức khoẻ / Chất lượng</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Deadline xử lý</label>
                    <div className="flex items-center mt-1 p-2 border rounded bg-slate-100 text-slate-600">
                      <Calendar size={18} className="mr-2" />
                      {formData.claim_deadline ? new Date(formData.claim_deadline).toLocaleString('vi-VN') : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Người phụ trách</label>
                    <select value={formData.claim_assignee_id || ''} onChange={e => handleChange('claim_assignee_id', e.target.value)} className="w-full p-2 border rounded mt-1">
                      <option value="">-- Chọn Quản lý --</option>
                      {employees.map((emp: any) => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Ảnh bằng chứng (Bắt buộc) {missingEvidence && <span className="text-red-500">*</span>}</label>
                  <div className="flex gap-2">
                    <button className={`w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition ${missingEvidence ? 'border-red-300 bg-red-50 text-red-400' : 'border-slate-300 bg-slate-50 text-slate-400 hover:bg-slate-100'}`} onClick={() => handleChange('evidence_photos', ['https://images.unsplash.com/photo-1568205612837-017257d2310a?w=400&q=80'])}>
                      <Camera size={24} className="mb-1" />
                      <span className="text-xs">Upload</span>
                    </button>
                    {formData.evidence_photos && formData.evidence_photos.length > 0 && formData.evidence_photos.map((url: string, i: number) => (
                      <div key={i} className="w-24 h-24 rounded-lg bg-cover bg-center border" style={{ backgroundImage: `url(${url})` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500 italic">Không ghi nhận sự cố nào trong quá trình bàn giao.</div>
            )}
          </section>

        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap gap-3 justify-end items-center rounded-b-2xl">
          <button onClick={() => handleSave('Draft')} className="px-4 py-2 border rounded-lg text-slate-700 bg-white hover:bg-slate-50">Lưu nháp</button>
          <button onClick={() => handleSave('Submitted')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Hoàn tất Nhận Heo</button>
          <div className="h-8 w-px bg-slate-300 mx-2"></div>
          <button 
            onClick={() => handleSave('Approved')} 
            disabled={formData.status !== 'Submitted' && formData.status !== 'Approved'}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50"
          >
            Manager Approve
          </button>
        </div>
      </div>
    </div>
  );
}
