import { useState, useEffect } from 'react';
import { X, Camera, AlertTriangle, FileText, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';

const VACCINES = ['Amlistin', 'Circo + Myco', 'Pendistrep', 'PRRS', 'SFV2', 'App + Dịch Tả'];

export default function HandoverForm({ handoverId, onClose, onSave, farmId, employees }: any) {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>({
    status: 'Draft',
    vaccine_data: [],
    age_data: []
  });

  useEffect(() => {
    if (handoverId === 'new') {
      setFormData({
        farm_id: farmId,
        status: 'Draft',
        document_no: `BG-${new Date().getTime().toString().slice(-6)}`,
        handover_time: new Date().toISOString(),
        vehicle_sanitized: false,
        total_qty: 0,
        male_qty: 0,
        female_qty: 0,
        total_weight: 0,
        avg_weight: 0,
        issues_qty: 0,
        vaccine_data: [],
        age_data: [],
        photos: []
      });
      setLoading(false);
    } else {
      fetchData();
    }
  }, [handoverId]);

  const fetchData = async () => {
    const { data } = await supabase.from('piglet_handovers').select('*').eq('id', handoverId).single();
    if (data) {
      setFormData(data);
    }
    setLoading(false);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => {
      const next = { ...prev, [field]: value };
      
      // Auto-calculate avg weight if total_qty and total_weight are present
      if (['total_qty', 'total_weight'].includes(field)) {
        const qty = field === 'total_qty' ? Number(value) : Number(next.total_qty || 0);
        const w = field === 'total_weight' ? Number(value) : Number(next.total_weight || 0);
        if (qty > 0) next.avg_weight = Number((w / qty).toFixed(2));
      }
      return next;
    });
  };

  const updateArrayData = (arrayName: 'vaccine_data' | 'age_data', index: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const newArray = [...prev[arrayName]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  };

  const addArrayItem = (arrayName: 'vaccine_data' | 'age_data', item: any) => {
    setFormData((prev: any) => ({ ...prev, [arrayName]: [...prev[arrayName], item] }));
  };

  const removeArrayItem = (arrayName: 'vaccine_data' | 'age_data', index: number) => {
    setFormData((prev: any) => {
      const newArray = [...prev[arrayName]];
      newArray.splice(index, 1);
      return { ...prev, [arrayName]: newArray };
    });
  };

  // Smart logic checks
  const qtyMismatch = Number(formData.male_qty || 0) + Number(formData.female_qty || 0) !== Number(formData.total_qty || 0);
  const lowWeight = formData.avg_weight > 0 && formData.avg_weight < 5.5;
  const missingVaccines = formData.vaccine_data.length < 3;
  const vehicleNotSanitized = formData.vehicle_sanitized === false;
  const missingIssueReason = formData.issues_qty > 0 && (!formData.issues_reason || formData.issues_reason.trim() === '');
  const missingDocPhoto = !formData.document_photo_url;

  const handleSave = async (newStatus?: string) => {
    let finalStatus = newStatus || formData.status;
    
    // Validations before Submit/Approve
    if (['Submitted', 'Approved'].includes(finalStatus)) {
      if (qtyMismatch) {
        alert('Lỗi: Tổng số Đực + Cái không khớp với Tổng số lượng giao!');
        return;
      }
      if (missingIssueReason) {
        alert('Lỗi: Có heo vấn đề nhưng chưa nhập lý do!');
        return;
      }
      if (missingDocPhoto) {
        alert('Lỗi: Yêu cầu cập nhật ảnh Biên bản giấy trước khi hoàn tất!');
        return;
      }
      if (vehicleNotSanitized) {
        if (!window.confirm('CẢNH BÁO AN TOÀN SINH HỌC: Xe vận chuyển chưa được sát trùng! Bạn vẫn muốn nộp phiếu?')) return;
      }
    }

    const payload = { ...formData, status: finalStatus };
    
    if (handoverId === 'new') {
      const { data } = await supabase.from('piglet_handovers').insert(payload).select().single();
      if (data) onSave(data.id);
    } else {
      await supabase.from('piglet_handovers').update(payload).eq('id', handoverId);
      
      // Auto-create receiving task if Approved
      if (finalStatus === 'Approved') {
        await supabase.from('assigned_tasks').insert({
          farm_id: farmId,
          task_category: 'receiving',
          task_description: `[TỰ ĐỘNG] Nhận heo từ phiếu bàn giao ${formData.document_no}`,
          status: 'assigned',
          employee_id: formData.receiver_engineer_id || null
        });
      }
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
              <FileText className="text-blue-600" />
              Biên bản Giao nhận Heo con
            </h2>
            <p className="text-sm text-slate-500">Mã: {formData.document_no}</p>
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
          
          {/* A & B & C: Header & Farm Info */}
          <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className={sectionHeaderClass}>Thông tin Xuất - Nhận</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-700">Trại Xuất (Nái)</h4>
                <div><label className="text-sm text-slate-600">Tên trại</label><input type="text" value={formData.source_farm_name || ''} onChange={e => handleChange('source_farm_name', e.target.value)} className="w-full p-2 border rounded bg-slate-50 mt-1" /></div>
                <div>
                  <label className="text-sm text-slate-600">Kỹ sư bên giao</label>
                  <select value={formData.sender_engineer_id || ''} onChange={e => handleChange('sender_engineer_id', e.target.value)} className="w-full p-2 border rounded bg-slate-50 mt-1">
                    <option value="">-- Chọn --</option>
                    {employees.map((emp: any) => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-700">Trại Nhận</h4>
                <div><label className="text-sm text-slate-600">Tên trại</label><input type="text" value={formData.dest_farm_name || ''} onChange={e => handleChange('dest_farm_name', e.target.value)} className="w-full p-2 border rounded bg-slate-50 mt-1" /></div>
                <div><label className="text-sm text-slate-600">Loại trại</label>
                  <select value={formData.dest_farm_type || ''} onChange={e => handleChange('dest_farm_type', e.target.value)} className="w-full p-2 border rounded bg-slate-50 mt-1">
                    <option value="Hậu bị">Hậu bị</option><option value="Úm">Úm</option><option value="Nuôi thịt">Nuôi thịt</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Kỹ sư bên nhận</label>
                  <select value={formData.receiver_engineer_id || ''} onChange={e => handleChange('receiver_engineer_id', e.target.value)} className="w-full p-2 border rounded bg-slate-50 mt-1">
                    <option value="">-- Chọn --</option>
                    {employees.map((emp: any) => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* D. Vận chuyển */}
          <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className={sectionHeaderClass}>Vận chuyển</h3>
            {vehicleNotSanitized && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p><strong>CRITICAL:</strong> Xe vận chuyển chưa được sát trùng. Rủi ro An toàn sinh học cao!</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div><label className="text-sm text-slate-600">Lái xe</label><input type="text" value={formData.driver_name || ''} onChange={e => handleChange('driver_name', e.target.value)} className="w-full p-2 border rounded bg-slate-50 mt-1" /></div>
              <div><label className="text-sm text-slate-600">Biển số xe</label><input type="text" value={formData.vehicle_plate || ''} onChange={e => handleChange('vehicle_plate', e.target.value)} className="w-full p-2 border rounded bg-slate-50 mt-1" /></div>
              <div><label className="text-sm text-slate-600">Giờ rời đi</label><input type="time" value={formData.departure_time ? new Date(formData.departure_time).toTimeString().slice(0,5) : ''} onChange={e => {
                const d = new Date(); d.setHours(parseInt(e.target.value.split(':')[0]), parseInt(e.target.value.split(':')[1])); handleChange('departure_time', d.toISOString());
              }} className="w-full p-2 border rounded bg-slate-50 mt-1" /></div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 p-2 border rounded bg-slate-50 w-full cursor-pointer hover:bg-slate-100">
                  <input type="checkbox" checked={formData.vehicle_sanitized || false} onChange={e => handleChange('vehicle_sanitized', e.target.checked)} className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Xe đã sát trùng</span>
                </label>
              </div>
            </div>
          </section>

          {/* E. Số lượng */}
          <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className={sectionHeaderClass}>Số lượng Bàn giao</h3>
            {qtyMismatch && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle size={18} /> Tổng (Đực + Cái) khác Tổng số lượng giao!
              </div>
            )}
            {lowWeight && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg flex items-center gap-2 text-sm">
                <AlertTriangle size={18} /> Trọng lượng bình quân quá thấp ({formData.avg_weight} kg).
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div><label className="text-sm text-slate-600 font-bold">Tổng số lượng</label><input type="number" value={formData.total_qty || 0} onChange={e => handleChange('total_qty', e.target.value)} className="w-full p-2 border-2 border-blue-200 rounded font-bold text-lg mt-1" /></div>
              <div><label className="text-sm text-slate-600">Số lượng Đực</label><input type="number" value={formData.male_qty || 0} onChange={e => handleChange('male_qty', e.target.value)} className="w-full p-2 border rounded bg-slate-50 mt-1" /></div>
              <div><label className="text-sm text-slate-600">Số lượng Cái</label><input type="number" value={formData.female_qty || 0} onChange={e => handleChange('female_qty', e.target.value)} className="w-full p-2 border rounded bg-slate-50 mt-1" /></div>
              <div><label className="text-sm text-slate-600">Tổng TL (kg)</label><input type="number" value={formData.total_weight || 0} onChange={e => handleChange('total_weight', e.target.value)} className="w-full p-2 border rounded bg-slate-50 mt-1" /></div>
              <div><label className="text-sm text-slate-600">TL Bình quân</label><input type="text" readOnly value={formData.avg_weight || 0} className="w-full p-2 border border-slate-200 bg-slate-100 rounded mt-1 font-semibold text-slate-600" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
              <div><label className="text-sm text-red-600 font-medium">Số heo có vấn đề</label><input type="number" value={formData.issues_qty || 0} onChange={e => handleChange('issues_qty', e.target.value)} className="w-full p-2 border border-red-200 rounded bg-red-50 mt-1" /></div>
              <div className="md:col-span-2">
                <label className="text-sm text-slate-600">Lý do heo có vấn đề {missingIssueReason && <span className="text-red-500">* (Bắt buộc)</span>}</label>
                <input type="text" value={formData.issues_reason || ''} onChange={e => handleChange('issues_reason', e.target.value)} className={`w-full p-2 border rounded mt-1 ${missingIssueReason ? 'border-red-500 bg-red-50' : 'bg-slate-50'}`} placeholder="Liệt kê vấn đề..." />
              </div>
            </div>
          </section>

          {/* F & G: Data Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vaccine */}
            <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className={sectionHeaderClass}>
                Lịch chủng Vaccine
                {missingVaccines && <span className="ml-auto text-xs text-amber-600 flex items-center font-normal"><AlertTriangle size={14} className="mr-1"/> Thiếu thông tin vaccine</span>}
              </h3>
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600">
                  <tr><th className="p-2">Tên Vaccine</th><th className="p-2">Ngày tiêm</th><th className="p-2 w-16">Tuần</th><th className="p-2"></th></tr>
                </thead>
                <tbody>
                  {formData.vaccine_data.map((v: any, i: number) => (
                    <tr key={i} className="border-b">
                      <td className="p-1">
                        <select value={v.name || ''} onChange={e => updateArrayData('vaccine_data', i, 'name', e.target.value)} className="w-full p-1.5 border rounded">
                          <option value="">-- Chọn --</option>
                          {VACCINES.map(vac => <option key={vac} value={vac}>{vac}</option>)}
                        </select>
                      </td>
                      <td className="p-1"><input type="date" value={v.date || ''} onChange={e => updateArrayData('vaccine_data', i, 'date', e.target.value)} className="w-full p-1.5 border rounded" /></td>
                      <td className="p-1"><input type="number" value={v.week || ''} onChange={e => updateArrayData('vaccine_data', i, 'week', e.target.value)} className="w-full p-1.5 border rounded" /></td>
                      <td className="p-1 text-right"><button onClick={() => removeArrayItem('vaccine_data', i)} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={16}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => addArrayItem('vaccine_data', { name: '', date: '', week: '' })} className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center"><Plus size={16} className="mr-1"/> Thêm Vaccine</button>
            </section>

            {/* Age */}
            <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className={sectionHeaderClass}>Theo dõi tuần tuổi</h3>
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600">
                  <tr><th className="p-2">Tuần sinh</th><th className="p-2">Tuần tuổi</th><th className="p-2 w-20">Số lượng</th><th className="p-2"></th></tr>
                </thead>
                <tbody>
                  {formData.age_data.map((a: any, i: number) => (
                    <tr key={i} className="border-b">
                      <td className="p-1"><input type="text" value={a.birth_week || ''} onChange={e => updateArrayData('age_data', i, 'birth_week', e.target.value)} className="w-full p-1.5 border rounded" placeholder="Tuần 20"/></td>
                      <td className="p-1"><input type="number" value={a.age_week || ''} onChange={e => updateArrayData('age_data', i, 'age_week', e.target.value)} className="w-full p-1.5 border rounded" /></td>
                      <td className="p-1"><input type="number" value={a.qty || ''} onChange={e => updateArrayData('age_data', i, 'qty', e.target.value)} className="w-full p-1.5 border rounded" /></td>
                      <td className="p-1 text-right"><button onClick={() => removeArrayItem('age_data', i)} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={16}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => addArrayItem('age_data', { birth_week: '', age_week: '', qty: '' })} className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center"><Plus size={16} className="mr-1"/> Thêm Dòng</button>
            </section>
          </div>

          {/* H. Kết luận & Ảnh */}
          <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className={sectionHeaderClass}>Xác nhận & Biên bản giấy</h3>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 space-y-4">
                <p className="text-sm text-slate-600">Các bên xác nhận tính chính xác của dữ liệu số lượng, vaccine và tình trạng heo.</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2"><input type="checkbox" checked className="w-4 h-4 text-blue-600 rounded"/> <span>Bên giao</span></div>
                  <div className="flex items-center gap-2"><input type="checkbox" checked={formData.status === 'Approved'} readOnly className="w-4 h-4 text-emerald-600 rounded"/> <span>Bên nhận</span></div>
                </div>
              </div>
              <div className="shrink-0">
                <label className="block text-sm font-bold text-slate-700 mb-2">Ảnh Biên bản giấy {missingDocPhoto && <span className="text-red-500">*</span>}</label>
                <div className={`w-32 h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition bg-cover bg-center ${missingDocPhoto ? 'border-red-300 bg-red-50 text-red-400' : 'border-slate-300 text-slate-400'}`} style={formData.document_photo_url ? { backgroundImage: `url(${formData.document_photo_url})`, borderStyle: 'solid' } : {}} onClick={() => handleChange('document_photo_url', 'https://images.unsplash.com/photo-1568205612837-017257d2310a?w=400&q=80')}>
                  {!formData.document_photo_url && (
                    <>
                      <Camera size={24} className="mb-2" />
                      <span className="text-xs text-center px-2">Click giả lập Upload</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap gap-3 justify-end items-center rounded-b-2xl">
          <button onClick={() => handleSave('Draft')} className="px-4 py-2 border rounded-lg text-slate-700 bg-white hover:bg-slate-50">Lưu nháp</button>
          <button onClick={() => handleSave('Submitted')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Submit Biên Bản</button>
          <div className="h-8 w-px bg-slate-300 mx-2"></div>
          <button 
            onClick={() => handleSave('Approved')} 
            disabled={formData.status !== 'Submitted' && formData.status !== 'Approved'}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50"
          >
            Approve (Bên Nhận)
          </button>
        </div>
      </div>
    </div>
  );
}
