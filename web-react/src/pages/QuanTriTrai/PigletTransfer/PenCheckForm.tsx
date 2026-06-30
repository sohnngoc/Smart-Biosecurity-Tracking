import { useState, useEffect } from 'react';
import { X, Camera, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';

export default function PenCheckForm({ penCheckId, onClose, onSave, farmId, barns, employees }: any) {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>({
    status: 'Draft',
    checklist_data: {}
  });

  useEffect(() => {
    if (penCheckId === 'new') {
      setFormData({
        farm_id: farmId,
        status: 'Draft',
        checklist_data: {
          is_washed: false,
          is_disinfected: false,
          water_system_ok: false,
          fan_system_ok: false,
          temp_ok: false,
          no_animals: false,
          pathway_clean: false,
        },
        photos: []
      });
      setLoading(false);
    } else {
      fetchData();
    }
  }, [penCheckId]);

  const fetchData = async () => {
    const { data } = await supabase.from('pen_checks').select('*').eq('id', penCheckId).single();
    if (data) {
      setFormData(data);
    }
    setLoading(false);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleChecklistChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      checklist_data: {
        ...prev.checklist_data,
        [field]: value
      }
    }));
  };

  // Smart logic checks
  const isDisinfectionCritical = formData.checklist_data?.is_disinfected === false || !formData.checklist_data?.disinfection_date;
  const isEnvOk = formData.checklist_data?.water_system_ok && formData.checklist_data?.fan_system_ok && formData.checklist_data?.temp_ok;
  const missingPhotos = !formData.photos || formData.photos.length === 0;

  const handleSave = async (newStatus?: string) => {
    let finalStatus = newStatus || formData.status;
    
    // Auto-alert for missing photos
    if (finalStatus === 'Submitted' && missingPhotos) {
      if (!window.confirm('Cảnh báo: Bạn chưa có hình ảnh xác nhận. Bạn vẫn muốn Submit?')) {
        return;
      }
    }

    const payload = { ...formData, status: finalStatus };
    
    if (penCheckId === 'new') {
      const { data } = await supabase.from('pen_checks').insert(payload).select().single();
      if (data) onSave(data.id);
    } else {
      await supabase.from('pen_checks').update(payload).eq('id', penCheckId);
      onSave();
    }
  };

  const handleApprove = () => {
    if (!isEnvOk) {
      alert('Không thể Approve: Điều kiện nhiệt độ/nước/quạt chưa đạt yêu cầu!');
      return;
    }
    handleSave('Approved');
  };

  const handleReject = async () => {
    if (window.confirm('Khóa duyệt: Bạn có muốn tự động tạo Task "Khắc phục chuồng" cho nhân viên không?')) {
      // Auto create task
      await supabase.from('assigned_tasks').insert({
        farm_id: farmId,
        task_category: 'technical',
        barn_id: formData.barn_id,
        task_description: `[TỰ ĐỘNG] Khắc phục các vấn đề kiểm tra chuồng: ${formData.issues_found || 'Xem chi tiết trong phiếu kiểm tra.'}`,
        status: 'assigned',
        employee_id: formData.inspector_id
      });
      alert('Đã tạo task khắc phục!');
    }
    handleSave('Rejected');
  };

  if (loading) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Biểu mẫu Kiểm tra chuồng</h2>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border
              ${formData.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ''}
              ${formData.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' : ''}
              ${['Draft', 'Assigned'].includes(formData.status) ? 'bg-slate-100 text-slate-700 border-slate-200' : ''}
              ${['Submitted', 'Vet Reviewed'].includes(formData.status) ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
              ${formData.status === 'Need Recheck' ? 'bg-amber-100 text-amber-700 border-amber-200' : ''}
            `}>
              {formData.status}
            </span>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg"><X size={20} /></button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          
          {/* Section A */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">A</span>
              Thông tin chung
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Khu/Chuồng</label>
                <select value={formData.barn_id || ''} onChange={e => handleChange('barn_id', e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50">
                  <option value="">-- Chọn chuồng --</option>
                  {barns.map((b: any) => <option key={b.id} value={b.id}>{b.barn_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Mã ô chuồng</label>
                <input type="text" value={formData.pen_code || ''} onChange={e => handleChange('pen_code', e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Người kiểm tra</label>
                <select value={formData.inspector_id || ''} onChange={e => handleChange('inspector_id', e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50">
                  <option value="">-- Chọn nhân viên --</option>
                  {employees.map((emp: any) => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Ngày giờ kiểm tra</label>
                <input type="datetime-local" value={formData.check_time ? new Date(formData.check_time).toISOString().slice(0, 16) : ''} onChange={e => handleChange('check_time', e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Dự kiến ngày nhận heo</label>
                <input type="date" value={formData.expected_receive_date || ''} onChange={e => handleChange('expected_receive_date', e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Trại nguồn dự kiến</label>
                <input type="text" value={formData.expected_source_farm || ''} onChange={e => handleChange('expected_source_farm', e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50" placeholder="VD: Trại Nái 1" />
              </div>
            </div>
          </section>

          {/* Section B */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
              <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">B</span>
              Checklist vệ sinh & sát trùng
            </h3>

            {isDisinfectionCritical && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm"><strong>CRITICAL:</strong> Chuồng chưa được sát trùng hoặc chưa nhập ngày sát trùng. Không đủ điều kiện an toàn sinh học.</p>
              </div>
            )}

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border hover:bg-slate-100 cursor-pointer">
                <input type="checkbox" checked={formData.checklist_data?.is_washed || false} onChange={e => handleChecklistChange('is_washed', e.target.checked)} className="w-5 h-5 text-emerald-600" />
                <span className="font-medium">Chuồng đã rửa sạch?</span>
              </label>
              
              <div className="p-3 bg-slate-50 rounded-lg border">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input type="checkbox" checked={formData.checklist_data?.is_disinfected || false} onChange={e => handleChecklistChange('is_disinfected', e.target.checked)} className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium">Chuồng đã sát trùng?</span>
                </label>
                {formData.checklist_data?.is_disinfected && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-8">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Ngày giờ sát trùng</label>
                      <input type="datetime-local" value={formData.checklist_data?.disinfection_date || ''} onChange={e => handleChecklistChange('disinfection_date', e.target.value)} className="w-full p-2 border rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Hóa chất</label>
                      <input type="text" value={formData.checklist_data?.chemical || ''} onChange={e => handleChecklistChange('chemical', e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="VD: Virkon S" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Nồng độ</label>
                      <input type="text" value={formData.checklist_data?.concentration || ''} onChange={e => handleChecklistChange('concentration', e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="VD: 1%" />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border hover:bg-slate-100 cursor-pointer">
                  <span className="font-medium">Hệ thống nước hoạt động tốt</span>
                  <input type="checkbox" checked={formData.checklist_data?.water_system_ok || false} onChange={e => handleChecklistChange('water_system_ok', e.target.checked)} className="w-5 h-5 text-emerald-600" />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border hover:bg-slate-100 cursor-pointer">
                  <span className="font-medium">Hệ thống thông gió/quạt tốt</span>
                  <input type="checkbox" checked={formData.checklist_data?.fan_system_ok || false} onChange={e => handleChecklistChange('fan_system_ok', e.target.checked)} className="w-5 h-5 text-emerald-600" />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border hover:bg-slate-100 cursor-pointer">
                  <span className="font-medium">Nhiệt độ phòng phù hợp</span>
                  <input type="checkbox" checked={formData.checklist_data?.temp_ok || false} onChange={e => handleChecklistChange('temp_ok', e.target.checked)} className="w-5 h-5 text-emerald-600" />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border hover:bg-slate-100 cursor-pointer">
                  <span className="font-medium">Không có động vật/heo tồn</span>
                  <input type="checkbox" checked={formData.checklist_data?.no_animals || false} onChange={e => handleChecklistChange('no_animals', e.target.checked)} className="w-5 h-5 text-emerald-600" />
                </label>
              </div>

              <div className="mt-4">
                <label className="block font-medium text-slate-700 mb-2">Hình ảnh xác nhận</label>
                <div className="flex gap-2 items-center">
                  <button className="flex flex-col items-center justify-center w-24 h-24 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg hover:bg-slate-200 transition text-slate-500">
                    <Camera size={24} className="mb-1" />
                    <span className="text-xs">Chụp ảnh</span>
                  </button>
                  {/* Mock image thumbnail */}
                  {formData.photos && formData.photos.length > 0 && formData.photos.map((url: string, i: number) => (
                    <div key={i} className="w-24 h-24 rounded-lg bg-cover bg-center border" style={{ backgroundImage: `url(${url})` }}></div>
                  ))}
                  {missingPhotos && (
                    <div className="ml-2 text-amber-600 flex items-center text-sm">
                      <AlertTriangle size={16} className="mr-1" /> Chưa có ảnh
                    </div>
                  )}
                </div>
              </div>

            </div>
          </section>

          {/* Section C */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
              <span className="bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">C</span>
              Kết luận
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 cursor-pointer">
                <input type="radio" name="is_ready" checked={formData.is_ready === true} onChange={() => handleChange('is_ready', true)} className="w-5 h-5 text-emerald-600" />
                <span className="font-bold">READY TO RECEIVE (Đủ điều kiện nhận heo)</span>
              </label>
              <label className="flex items-center gap-3 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200 cursor-pointer">
                <input type="radio" name="is_ready" checked={formData.is_ready === false} onChange={() => handleChange('is_ready', false)} className="w-5 h-5 text-red-600" />
                <span className="font-bold">CHƯA SẴN SÀNG</span>
              </label>

              {formData.is_ready === false && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Vấn đề phát hiện</label>
                  <textarea value={formData.issues_found || ''} onChange={e => handleChange('issues_found', e.target.value)} className="w-full p-3 border rounded-lg bg-slate-50 min-h-[80px]" placeholder="Nhập mô tả vấn đề..." />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Ghi chú thêm</label>
                <textarea value={formData.notes || ''} onChange={e => handleChange('notes', e.target.value)} className="w-full p-3 border rounded-lg bg-slate-50 min-h-[80px]" />
              </div>
            </div>
          </section>

        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap gap-3 justify-end items-center">
          <span className="text-sm text-slate-500 mr-auto">
            {isEnvOk ? <span className="text-emerald-600 flex items-center"><CheckCircle2 size={16} className="mr-1"/> Điều kiện MT Đạt</span> : <span className="text-red-600 flex items-center"><AlertCircle size={16} className="mr-1"/> Điều kiện MT Chưa đạt</span>}
          </span>
          
          <button onClick={() => handleSave('Draft')} className="px-4 py-2 border rounded-lg text-slate-700 bg-white hover:bg-slate-50">Lưu nháp</button>
          <button onClick={() => handleSave('Submitted')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Submit (Trình duyệt)</button>
          
          {/* Manager Actions */}
          <div className="h-8 w-px bg-slate-300 mx-2"></div>
          <button onClick={handleReject} className="px-4 py-2 bg-red-100 text-red-700 border border-red-200 rounded-lg hover:bg-red-200 font-medium">Reject & Khắc phục</button>
          <button 
            onClick={handleApprove} 
            disabled={!isEnvOk || isDisinfectionCritical}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title={!isEnvOk ? 'Không thể Approve do chưa đạt điều kiện môi trường/sát trùng' : ''}
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
