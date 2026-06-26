import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { calculateFormScore, calculateOverallFarmAssessment } from '../../../../lib/assessmentLogic';
import { Save, AlertTriangle, Upload, Image as ImageIcon } from 'lucide-react';

export default function FormTab({ formCode, farmId, periodId }: { formCode: string, farmId: string | undefined, periodId: string }) {
  const [criteria, setCriteria] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [sessionData, setSessionData] = useState<any>(null);

  // Header Mock Data updated via period
  const [farmInfo, setFarmInfo] = useState({
    farmName: 'Đang tải...',
    farmType: '...',
    region: '...',
    assessor: 'Admin',
    period: '...'
  });

  const notesTags = ['Nhân sự chưa tuân thủ', 'Thiếu giám sát', 'Không gửi bằng chứng', 'Không ghi chép', 'Quy trình chưa rõ', 'Thiếu đào tạo', 'Khác'];
  const actionTags = ['Đào tạo lại nhân sự', 'Bổ sung bằng chứng', 'Cập nhật quy trình', 'Kiểm tra lại sau 7 ngày', 'Tăng tần suất giám sát', 'Xác nhận hoàn thành bằng hình ảnh'];

  useEffect(() => {
    const loadData = async () => {
      if (!farmId || !periodId) return;
      setLoading(true);

      // Fetch farm details
      const { data: farm } = await supabase.from('farms').select('*').eq('id', farmId).single();
      
      // Fetch period details
      const { data: period } = await supabase.from('assessment_periods').select('*').eq('id', periodId).single();

      if (farm && period) {
        setFarmInfo({
          farmName: farm.name,
          farmType: farm.type,
          region: farm.region,
          assessor: 'Admin',
          period: period.period_name
        });
      }

      // Fetch form
      const { data: form } = await supabase.from('assessment_forms').select('id').eq('code', formCode).single();
      if (!form) return;

      // Fetch session
      const { data: session } = await supabase.from('farm_assessment_sessions')
        .select('*')
        .eq('farm_id', farmId)
        .eq('form_id', form.id)
        .eq('period_id', periodId)
        .single();
      
      setSessionData(session);

      // Fetch criteria
      const { data: critData } = await supabase
        .from('assessment_criteria')
        .select('*')
        .eq('form_id', form.id)
        .order('display_order');
      
      if (critData) {
        setCriteria(critData);
        
        // Fetch existing answers if any
        let existingAnswers = [];
        if (session) {
          const { data: ansData } = await supabase.from('farm_assessment_answers').select('*').eq('session_id', session.id);
          if (ansData) existingAnswers = ansData;
        }

        const initialAns: any = {};
        critData.forEach(c => {
          const exist = existingAnswers.find((a: any) => a.criteria_id === c.id);
          initialAns[c.id] = {
            id: exist?.id, // for upsert
            criteria_id: c.id,
            score: exist?.score || null,
            is_na: exist?.is_na || false,
            notes: exist?.notes || '',
            corrective_action: exist?.corrective_action || '',
            action_owner: exist?.action_owner || '',
            due_date: exist?.due_date || '',
            evidence_urls: exist?.evidence_urls || []
          };
        });
        setAnswers(initialAns);
      }
      setLoading(false);
    };

    loadData();
  }, [formCode, farmId, periodId]);

  const handleScoreChange = (critId: string, val: string) => {
    let score = null;
    let is_na = false;
    if (val === 'NA') {
      is_na = true;
    } else if (val) {
      score = Number(val);
    }

    setAnswers(prev => ({
      ...prev,
      [critId]: { ...prev[critId], score, is_na }
    }));
  };

  const handleTextChange = (critId: string, field: string, val: string) => {
    setAnswers(prev => ({
      ...prev,
      [critId]: { ...prev[critId], [field]: val }
    }));
  };

  const validateForm = () => {
    setErrorMsg('');
    for (const c of criteria) {
      const ans = answers[c.id];
      
      if (c.is_mandatory && ans.score === null && !ans.is_na) {
        return `Tiêu chí bắt buộc chưa đánh giá: [${c.criteria_code}] ${c.criteria_name}`;
      }
      if (c.is_mandatory && ans.score !== null && ans.score <= 3 && !ans.notes.trim()) {
        return `Tiêu chí bắt buộc bị điểm thấp (<=3) cần ghi chú nguyên nhân: [${c.criteria_code}]`;
      }
      if (ans.score !== null && ans.score <= 3) {
        if (!ans.corrective_action.trim()) return `Vui lòng nhập Hành động khắc phục cho: [${c.criteria_code}]`;
        if (!ans.action_owner.trim()) return `Vui lòng nhập Người phụ trách khắc phục cho: [${c.criteria_code}]`;
        if (!ans.due_date) return `Vui lòng chọn Hạn hoàn thành khắc phục cho: [${c.criteria_code}]`;
      }
      if (c.evidence_required && !ans.is_na && (!ans.notes || !ans.notes.includes('http'))) {
        return `Tiêu chí yêu cầu bằng chứng (URL ảnh trong Ghi chú): [${c.criteria_code}]`;
      }
      if (c.is_mandatory && ans.is_na && !ans.notes.trim()) {
        return `Đánh giá N/A cho tiêu chí bắt buộc cần lý do (Ghi chú): [${c.criteria_code}]`;
      }
    }
    return null;
  };

  const answersWithCriteria = criteria.map(c => ({
    ...answers[c.id],
    criteria: c
  }));
  const { scorePercent, riskLevel, totalWeight, totalConvertedScore } = calculateFormScore(answersWithCriteria);

  const handleSubmit = async () => {
    if (!sessionData) {
      setErrorMsg('Lỗi: Không tìm thấy Phiên đánh giá. Vui lòng thử tải lại trang.');
      return;
    }

    const error = validateForm();
    if (error) {
      setErrorMsg(error);
      window.scrollTo(0, 0);
      return;
    }

    try {
      // 1. Save answers
      const answersToUpsert = Object.values(answers).map((ans: any) => ({
        id: ans.id, // if undefined, it will insert
        session_id: sessionData.id,
        criteria_id: ans.criteria_id,
        score: ans.score,
        is_na: ans.is_na,
        notes: ans.notes,
        corrective_action: ans.corrective_action,
        action_owner: ans.action_owner,
        due_date: ans.due_date || null
      }));

      const { error: upsertErr } = await supabase.from('farm_assessment_answers').upsert(answersToUpsert, { onConflict: 'session_id, criteria_id' });
      if (upsertErr) throw upsertErr;

      // 2. Update Session Score
      const { error: sessErr } = await supabase.from('farm_assessment_sessions').update({
        total_weight: totalWeight,
        total_converted_score: totalConvertedScore,
        score_percent: scorePercent,
        risk_level: riskLevel,
        status: 'submitted',
        completed_at: new Date().toISOString()
      }).eq('id', sessionData.id);
      
      if (sessErr) throw sessErr;

      // 3. Update Dashboard Summary
      // We need to fetch all 3 sessions to recalculate overall score
      const { data: allSessions } = await supabase.from('farm_assessment_sessions')
        .select('*, assessment_forms(code)')
        .eq('farm_id', farmId)
        .eq('period_id', periodId);

      let hwScore = null, swScore = null, clScore = null;

      if (allSessions) {
        allSessions.forEach((s: any) => {
          if (s.assessment_forms.code === 'HARDWARE') { hwScore = s.score_percent; }
          if (s.assessment_forms.code === 'SOFTWARE') { swScore = s.score_percent; }
          if (s.assessment_forms.code === 'CHECKLIST_NAI_HB') { clScore = s.score_percent; }
        });
      }

      // Re-assign this form's score because the DB fetch above might be stale if it didn't commit fast enough
      if (formCode === 'HARDWARE') { hwScore = scorePercent; }
      if (formCode === 'SOFTWARE') { swScore = scorePercent; }

      const { overallScore, overallRisk } = calculateOverallFarmAssessment(hwScore, swScore, clScore);
      
      const biosecurity_risk_score = overallScore;

      const updatePayload: any = {
        farm_id: farmId,
        overall_assessment_score: overallScore,
        overall_risk_level: overallRisk,
        last_assessment_date: new Date().toISOString().split('T')[0],
        last_assessment_period: farmInfo.period
      };
      if (formCode === 'HARDWARE') { updatePayload.latest_hardware_score = scorePercent; updatePayload.latest_hardware_risk_level = riskLevel; }
      if (formCode === 'SOFTWARE') { updatePayload.latest_software_score = scorePercent; updatePayload.latest_software_risk_level = riskLevel; }

      await supabase.from('farm_assessment_dashboard_summary').upsert(updatePayload, { onConflict: 'farm_id' });

      // Sync with global map farms table
      await supabase.from('farms').update({
        risk_score: biosecurity_risk_score,
        overall_status: overallRisk
      }).eq('id', farmId);

      alert('Lưu thành công! Kết quả đã đồng bộ lên Dashboard.');
      setErrorMsg('');
      
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Đã có lỗi xảy ra khi lưu: ' + err.message);
    }
  };

  const getRowColor = (score: number | null, is_na: boolean) => {
    if (is_na) return 'bg-gray-100 text-gray-500';
    if (score === null) return 'bg-white';
    if (score <= 2) return 'bg-red-50 text-red-900';
    if (score === 3) return 'bg-orange-50 text-orange-900';
    if (score === 4) return 'bg-blue-50 text-blue-900';
    if (score === 5) return 'bg-green-50 text-green-900';
    return 'bg-white';
  };

  if (loading) return <div className="p-4 text-gray-500">Đang đồng bộ dữ liệu kỳ đánh giá...</div>;

  const grouped = criteria.reduce((acc, curr) => {
    if (!acc[curr.group_name]) acc[curr.group_name] = [];
    acc[curr.group_name].push(curr);
    return acc;
  }, {});

  const getRiskColor = (risk: string) => {
    if (risk === 'Nguy cơ cao') return 'text-red-600 bg-red-100';
    if (risk === 'Nguy cơ trung bình') return 'text-orange-600 bg-orange-100';
    if (risk === 'Nguy cơ thấp') return 'text-yellow-600 bg-yellow-100';
    if (risk === 'Đạt') return 'text-green-600 bg-green-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start shadow-sm">
          <AlertTriangle className="text-red-500 mr-3 mt-0.5" size={20} />
          <div>
            <h3 className="text-red-800 font-bold">Lỗi / Thông báo</h3>
            <p className="text-red-700 text-sm mt-1">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Form Header Info */}
      <div className="bg-white border rounded-xl shadow-sm p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div><span className="text-gray-500">Tên trại:</span> <strong className="block text-gray-900">{farmInfo.farmName}</strong></div>
        <div><span className="text-gray-500">Mã trại:</span> <strong className="block text-gray-900">{farmId || 'F-001'}</strong></div>
        <div><span className="text-gray-500">Khu vực:</span> <strong className="block text-gray-900">{farmInfo.region}</strong></div>
        <div><span className="text-gray-500">Kỳ đánh giá:</span> <strong className="block text-blue-600">{farmInfo.period}</strong></div>
        <div><span className="text-gray-500">Người đánh giá:</span> <strong className="block text-gray-900">{farmInfo.assessor}</strong></div>
        <div><span className="text-gray-500">Ngày đánh giá:</span> <strong className="block text-gray-900">{new Date().toLocaleDateString('vi-VN')}</strong></div>
        <div><span className="text-gray-500">Trạng thái Phiên:</span> <strong className="block text-blue-600">{sessionData?.status || 'Draft'}</strong></div>
        <div><span className="text-gray-500">Phiên bản Form:</span> <strong className="block text-gray-900">v2.1 (Sync DB)</strong></div>
      </div>

      <div className="flex justify-between items-center bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-blue-900">Chi tiết biểu mẫu: {formCode === 'HARDWARE' ? 'Phần cứng' : 'Phần mềm'}</h2>
          <p className="text-sm text-blue-700 mt-1">Dữ liệu được Auto-sync lưu tự động theo kỳ.</p>
        </div>
        <div className="text-right flex items-center space-x-6">
          <div>
            <div className="text-sm text-gray-500 font-medium">Tổng điểm quy đổi</div>
            <div className="text-3xl font-black text-blue-700">{scorePercent}%</div>
          </div>
          <div className={`px-4 py-2 rounded-lg font-bold ${getRiskColor(riskLevel)}`}>
            {riskLevel}
          </div>
        </div>
      </div>

      {Object.entries(grouped).map(([groupName, items]: [string, any]) => (
        <div key={groupName} className="border border-gray-200 rounded-xl overflow-x-auto shadow-sm">
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 font-bold text-gray-800 sticky left-0">
            {groupName}
          </div>
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-white">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase border-b min-w-[250px]">Tiêu chí ({items.length})</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase border-b w-16 text-center">Trọng số</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase border-b w-48 text-center">Điểm đánh giá</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase border-b min-w-[250px]">Ghi chú / Bằng chứng</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase border-b min-w-[250px]">Hành động khắc phục</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase border-b w-40">Người phụ trách</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase border-b w-40">Hạn hoàn thành</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((c: any) => {
                const ans = answers[c.id];
                if (!ans) return null; // Wait for load
                const bgClass = getRowColor(ans.score, ans.is_na);
                const isRepeatedError = formCode === 'SOFTWARE' && (c.criteria_code === 'SW_03' || c.criteria_code === 'SW_07');
                const isMissingEvidence = c.evidence_required && !ans.is_na && (!ans.notes || !ans.notes.includes('http'));
                
                return (
                  <tr key={c.id} className={`${bgClass} transition-colors`}>
                    <td className="px-4 py-3 whitespace-normal align-top">
                      <div className="font-medium flex items-center">
                        <span className="mr-2 text-gray-400 text-xs">{c.criteria_code}</span>
                        {c.criteria_name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 opacity-80">{c.criteria_description}</div>
                      
                      {isRepeatedError && (
                        <div className="text-[11px] text-red-600 mt-2 flex items-center font-bold bg-red-50 inline-block px-2 py-0.5 rounded border border-red-200">
                          <AlertTriangle size={12} className="mr-1" /> Lỗi tuân thủ lặp lại (Kỳ trước {'<='}3 đ)
                        </div>
                      )}

                      <div className="mt-2 flex space-x-2">
                        {c.is_mandatory && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Bắt buộc</span>}
                        {c.evidence_required && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Cần bằng chứng</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top font-bold text-center text-gray-500">{c.weight}</td>
                    <td className="px-4 py-3 align-top">
                      <select
                        value={ans.is_na ? 'NA' : (ans.score || '')}
                        onChange={(e) => handleScoreChange(c.id, e.target.value)}
                        className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
                      >
                        <option value="" disabled>-- Chọn --</option>
                        <option value="5">5 - Đạt</option>
                        <option value="4">4 - Đạt có điều kiện</option>
                        <option value="3">3 - Cần cải thiện</option>
                        <option value="2">2 - Không đạt</option>
                        <option value="1">1 - Không đạt nghiêm trọng</option>
                        <option value="NA">N/A - Không áp dụng</option>
                      </select>
                      {!ans.is_na && ans.score && (
                        <div className="text-center text-xs mt-2 font-bold opacity-70">
                          Quy đổi: {Number((c.weight * ans.score) / 5).toFixed(2)} / {c.weight}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <textarea
                        placeholder={c.evidence_required ? "Bắt buộc nhập URL ảnh..." : "Ghi chú..."}
                        value={ans.notes}
                        onChange={(e) => handleTextChange(c.id, 'notes', e.target.value)}
                        className={`w-full text-sm p-2 border rounded-md min-h-[80px] bg-white text-gray-900 ${isMissingEvidence ? 'border-red-400 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-blue-500'}`}
                      />
                      {formCode === 'SOFTWARE' && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {notesTags.map(tag => (
                            <button 
                              key={tag} 
                              onClick={() => handleTextChange(c.id, 'notes', ans.notes ? ans.notes + ', ' + tag : tag)} 
                              className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-600 px-1.5 py-1 rounded cursor-pointer whitespace-nowrap border border-gray-200"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      )}
                      {formCode === 'SOFTWARE' && (
                        <div className="mt-3 flex items-center space-x-2">
                          <button className="flex items-center text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1.5 rounded hover:bg-blue-100">
                            <Upload size={12} className="mr-1" /> Upload ảnh
                          </button>
                          {ans.notes.includes('http') && (
                            <div className="flex space-x-1">
                              <div className="w-8 h-8 bg-gray-200 rounded border border-gray-300 overflow-hidden flex items-center justify-center relative group">
                                <img src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=100&q=80" alt="thumb" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black bg-opacity-50 hidden group-hover:flex items-center justify-center cursor-pointer">
                                  <ImageIcon size={12} className="text-white" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <textarea
                        placeholder="Yêu cầu khắc phục..."
                        value={ans.corrective_action}
                        disabled={ans.score > 3 || ans.is_na}
                        onChange={(e) => handleTextChange(c.id, 'corrective_action', e.target.value)}
                        className="w-full text-sm p-2 border rounded-md min-h-[80px] bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed border-gray-300 focus:ring-blue-500"
                      />
                      {formCode === 'SOFTWARE' && (!ans.is_na && ans.score !== null && ans.score <= 3) && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {actionTags.map(tag => (
                            <button 
                              key={tag} 
                              onClick={() => handleTextChange(c.id, 'corrective_action', ans.corrective_action ? ans.corrective_action + ', ' + tag : tag)} 
                              className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 px-1.5 py-1 rounded cursor-pointer whitespace-nowrap border border-blue-200"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <input
                        type="text"
                        placeholder="Tên nhân sự..."
                        value={ans.action_owner}
                        disabled={ans.score > 3 || ans.is_na}
                        onChange={(e) => handleTextChange(c.id, 'action_owner', e.target.value)}
                        className="w-full text-sm p-2 border rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed border-gray-300 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <input
                        type="date"
                        value={ans.due_date}
                        disabled={ans.score > 3 || ans.is_na}
                        onChange={(e) => handleTextChange(c.id, 'due_date', e.target.value)}
                        className="w-full text-sm p-2 border rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed border-gray-300 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

      {/* Floating Save Button */}
      <div className="fixed bottom-6 right-6 flex space-x-3 z-50">
        <button 
          onClick={handleSubmit}
          className="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-full shadow-lg hover:bg-blue-700 transition-transform active:scale-95"
        >
          <Save size={20} className="mr-2" />
          Lưu & Đồng bộ Kết Quả
        </button>
      </div>
    </div>
  );
}
