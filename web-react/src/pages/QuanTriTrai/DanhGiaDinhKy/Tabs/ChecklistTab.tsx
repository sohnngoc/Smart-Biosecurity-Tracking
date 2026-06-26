import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { calculateFormScore, calculateOverallFarmAssessment } from '../../../../lib/assessmentLogic';
import { Save, AlertTriangle, CheckCircle, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

export default function ChecklistTab({ formCode, farmId, periodId }: { formCode: string, farmId: string | undefined, periodId: string }) {
  const [criteria, setCriteria] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [sessionData, setSessionData] = useState<any>(null);

  const [farmInfo, setFarmInfo] = useState({
    farmName: 'Đang tải...',
    farmType: '...',
    region: '...',
    assessor: 'Admin',
    period: '...'
  });

  useEffect(() => {
    const loadData = async () => {
      if (!farmId || !periodId) return;
      setLoading(true);

      const { data: farm } = await supabase.from('farms').select('*').eq('id', farmId).single();
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

      const { data: form } = await supabase.from('assessment_forms').select('id').eq('code', formCode).single();
      if (!form) return;

      const { data: session } = await supabase.from('farm_assessment_sessions')
        .select('*')
        .eq('farm_id', farmId)
        .eq('form_id', form.id)
        .eq('period_id', periodId)
        .single();
      
      setSessionData(session);

      const { data: critData } = await supabase
        .from('assessment_criteria')
        .select('*')
        .eq('form_id', form.id)
        .order('display_order');
      
      if (critData) {
        setCriteria(critData);
        let existingAnswers = [];
        if (session) {
          const { data: ansData } = await supabase.from('farm_assessment_answers').select('*').eq('session_id', session.id);
          if (ansData) existingAnswers = ansData;
        }

        const initialAns: any = {};
        critData.forEach(c => {
          const exist = existingAnswers.find((a: any) => a.criteria_id === c.id);
          
          // Reverse mapping for checklist_status
          let checklist_status = '';
          if (exist) {
            if (exist.is_na) checklist_status = 'NA';
            else if (exist.score === 5) checklist_status = 'Đạt';
            else if (exist.score === 3) checklist_status = 'Chưa đạt';
            else if (exist.score === 1) checklist_status = 'Không đạt';
          }

          initialAns[c.id] = {
            id: exist?.id,
            criteria_id: c.id,
            checklist_status: checklist_status,
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

  const handleStatusChange = (critId: string, val: string) => {
    setAnswers(prev => ({
      ...prev,
      [critId]: { ...prev[critId], checklist_status: val, is_na: val === 'NA' }
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
      const status = ans.is_na ? 'NA' : ans.checklist_status;
      
      if (c.is_mandatory && !status) {
        return `Tiêu chí bắt buộc chưa được đánh giá: [${c.criteria_code}] ${c.criteria_name}`;
      }
      if (c.is_mandatory && status === 'NA' && !ans.notes.trim()) {
        return `Đánh giá N/A cho tiêu chí bắt buộc cần có lý do (Ghi chú): [${c.criteria_code}]`;
      }
      if (status === 'Không đạt') {
        if (!ans.notes.trim()) return `Bắt buộc nhập Ghi chú nguyên nhân cho tiêu chí Không đạt: [${c.criteria_code}]`;
        if (!ans.corrective_action.trim()) return `Vui lòng nhập Hành động khắc phục cho: [${c.criteria_code}]`;
        if (!ans.action_owner.trim()) return `Vui lòng nhập Người phụ trách khắc phục cho: [${c.criteria_code}]`;
        if (!ans.due_date) return `Vui lòng chọn Hạn hoàn thành khắc phục cho: [${c.criteria_code}]`;
      }
      if (status === 'Chưa đạt') {
        if (!ans.notes.trim()) return `Bắt buộc nhập Ghi chú nguyên nhân cho tiêu chí Chưa đạt: [${c.criteria_code}]`;
        if (!ans.corrective_action.trim()) return `Vui lòng nhập Hành động khắc phục cho: [${c.criteria_code}]`;
      }
      if (c.evidence_required && status !== 'NA' && (!ans.notes || !ans.notes.includes('http'))) {
        return `Tiêu chí yêu cầu bằng chứng (URL ảnh trong Ghi chú): [${c.criteria_code}]`;
      }
    }
    return null;
  };

  // Convert checklist status to score for calculation
  const mapStatusToScore = (status: string) => {
    if (status === 'Đạt') return 5;
    if (status === 'Chưa đạt') return 3;
    if (status === 'Không đạt') return 1;
    return null;
  };

  const answersWithCriteria = criteria.map(c => {
    const a = answers[c.id];
    return {
      ...a,
      score: mapStatusToScore(a.checklist_status),
      criteria: c
    };
  });
  
  const { scorePercent, riskLevel, totalWeight, totalConvertedScore } = calculateFormScore(answersWithCriteria);

  const handleSubmit = async () => {
    if (!sessionData) {
      setErrorMsg('Lỗi: Không tìm thấy Phiên đánh giá.');
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
        id: ans.id,
        session_id: sessionData.id,
        criteria_id: ans.criteria_id,
        score: mapStatusToScore(ans.checklist_status),
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

      clScore = scorePercent;

      const { overallScore, overallRisk } = calculateOverallFarmAssessment(hwScore, swScore, clScore);
      
      const biosecurity_risk_score = overallScore;

      // Check mandatory fails
      const countMandatoryFail = answersWithCriteria.filter(a => !a.is_na && a.checklist_status === 'Không đạt' && a.criteria.is_mandatory).length;

      const updatePayload: any = {
        farm_id: farmId,
        overall_assessment_score: overallScore,
        overall_risk_level: overallRisk,
        last_assessment_date: new Date().toISOString().split('T')[0],
        last_assessment_period: farmInfo.period,
        mandatory_failed_count: countMandatoryFail
      };

      await supabase.from('farm_assessment_dashboard_summary').upsert(updatePayload, { onConflict: 'farm_id' });

      // Sync with global map farms table
      await supabase.from('farms').update({
        risk_score: biosecurity_risk_score,
        overall_status: countMandatoryFail > 0 ? 'Rủi ro cao' : overallRisk
      }).eq('id', farmId);

      alert('Lưu thành công! Kết quả Checklist Nái-HB đã đồng bộ lên Dashboard.');
      setErrorMsg('');
      
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Đã có lỗi xảy ra khi lưu: ' + err.message);
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Đang đồng bộ dữ liệu kỳ đánh giá...</div>;

  const grouped = criteria.reduce((acc, curr) => {
    if (!acc[curr.group_name]) acc[curr.group_name] = [];
    acc[curr.group_name].push(curr);
    return acc;
  }, {});

  // Kpi Counters
  const countDat = answersWithCriteria.filter(a => !a.is_na && a.checklist_status === 'Đạt').length;
  const countChuaDat = answersWithCriteria.filter(a => !a.is_na && a.checklist_status === 'Chưa đạt').length;
  const countKhongDat = answersWithCriteria.filter(a => !a.is_na && a.checklist_status === 'Không đạt').length;
  const countNa = answersWithCriteria.filter(a => a.is_na).length;
  const countMandatoryFail = answersWithCriteria.filter(a => !a.is_na && a.checklist_status === 'Không đạt' && a.criteria.is_mandatory).length;

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
            <h3 className="text-red-800 font-bold">Lỗi Validation</h3>
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

      {/* KPI Cards for Checklist */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-white border rounded-lg p-3 shadow-sm text-center">
          <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Tổng tiêu chí</div>
          <div className="text-2xl font-black text-gray-800">{criteria.length}</div>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-lg p-3 shadow-sm text-center">
          <div className="text-xs text-green-700 uppercase font-bold tracking-wider mb-1 flex items-center justify-center"><CheckCircle size={12} className="mr-1"/> Đạt</div>
          <div className="text-2xl font-black text-green-700">{countDat}</div>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 shadow-sm text-center">
          <div className="text-xs text-orange-700 uppercase font-bold tracking-wider mb-1 flex items-center justify-center"><AlertCircle size={12} className="mr-1"/> Chưa đạt</div>
          <div className="text-2xl font-black text-orange-700">{countChuaDat}</div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-lg p-3 shadow-sm text-center">
          <div className="text-xs text-red-700 uppercase font-bold tracking-wider mb-1 flex items-center justify-center"><XCircle size={12} className="mr-1"/> Không đạt</div>
          <div className="text-2xl font-black text-red-700">{countKhongDat}</div>
        </div>
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 shadow-sm text-center">
          <div className="text-xs text-gray-600 uppercase font-bold tracking-wider mb-1 flex items-center justify-center"><HelpCircle size={12} className="mr-1"/> N/A</div>
          <div className="text-2xl font-black text-gray-700">{countNa}</div>
        </div>
        <div className="bg-red-100 border border-red-300 rounded-lg p-3 shadow-sm text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
          <div className="text-[10px] text-red-800 uppercase font-black tracking-wider mb-1">Bắt buộc lỗi</div>
          <div className="text-2xl font-black text-red-700">{countMandatoryFail}</div>
        </div>
      </div>

      <div className="flex justify-between items-center bg-indigo-50 p-5 rounded-xl border border-indigo-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-indigo-900">Chi tiết CheckLIST NÁI-HB</h2>
          <p className="text-sm text-indigo-700 mt-1">Các tiêu chí bắt buộc nếu Không đạt sẽ bị cảnh báo đỏ. Cần xử lý ngay lập tức.</p>
        </div>
        <div className="text-right flex items-center space-x-6">
          <div>
            <div className="text-sm text-gray-500 font-medium">Tổng điểm quy đổi</div>
            <div className="text-3xl font-black text-indigo-700">{scorePercent}%</div>
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
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase border-b w-48 text-center">Trạng thái CheckLIST</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase border-b min-w-[250px]">Ghi chú / Bằng chứng</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase border-b min-w-[250px]">Hành động khắc phục</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase border-b w-40">Người phụ trách</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase border-b w-40">Hạn hoàn thành</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((c: any) => {
                const ans = answers[c.id];
                if (!ans) return null;
                const status = ans.is_na ? 'NA' : ans.checklist_status;
                
                // Color Logic
                let bgClass = 'bg-white hover:bg-gray-50';
                if (status === 'NA') bgClass = 'bg-gray-50 text-gray-500';
                if (status === 'Đạt') bgClass = 'bg-green-50/30';
                if (status === 'Chưa đạt') bgClass = c.is_mandatory ? 'bg-orange-50' : 'bg-orange-50/50';
                if (status === 'Không đạt') bgClass = c.is_mandatory ? 'bg-red-50 border-l-4 border-red-500' : 'bg-red-50/30';

                const isMissingEvidence = c.evidence_required && status !== 'NA' && (!ans.notes || !ans.notes.includes('http'));
                const disabledAction = status === 'Đạt' || status === 'NA' || !status;

                return (
                  <tr key={c.id} className={`${bgClass} transition-colors`}>
                    <td className="px-4 py-3 whitespace-normal align-top">
                      <div className="font-medium flex items-center">
                        <span className="mr-2 text-gray-400 text-xs">{c.criteria_code}</span>
                        {c.criteria_name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 opacity-80">{c.criteria_description}</div>
                      
                      {c.is_mandatory && status === 'Không đạt' && (
                        <div className="text-[11px] text-red-700 mt-2 inline-flex items-center font-bold bg-red-100 px-2 py-0.5 rounded border border-red-200">
                          <AlertTriangle size={12} className="mr-1" /> Bắt buộc không đạt
                        </div>
                      )}
                      {c.is_mandatory && status === 'Chưa đạt' && (
                        <div className="text-[11px] text-orange-700 mt-2 inline-flex items-center font-bold bg-orange-100 px-2 py-0.5 rounded border border-orange-200">
                          <AlertCircle size={12} className="mr-1" /> Cần cải thiện gấp
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
                        value={status}
                        onChange={(e) => handleStatusChange(c.id, e.target.value)}
                        className={`w-full text-sm rounded-md shadow-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none p-2 border ${
                          status === 'Không đạt' ? 'border-red-400 text-red-700 bg-red-50 font-bold' : 
                          status === 'Chưa đạt' ? 'border-orange-400 text-orange-700 bg-orange-50 font-bold' : 
                          status === 'Đạt' ? 'border-green-400 text-green-700 bg-green-50 font-bold' : 
                          'border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="" disabled>-- Chọn --</option>
                        <option value="Đạt">Đạt (5đ)</option>
                        <option value="Chưa đạt">Chưa đạt (3đ)</option>
                        <option value="Không đạt">Không đạt (1đ)</option>
                        <option value="NA">N/A - Không áp dụng</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <textarea
                        placeholder={c.evidence_required ? "Bắt buộc nhập URL ảnh..." : "Ghi chú nguyên nhân..."}
                        value={ans.notes}
                        onChange={(e) => handleTextChange(c.id, 'notes', e.target.value)}
                        className={`w-full text-sm p-2 border rounded-md min-h-[80px] bg-white text-gray-900 ${isMissingEvidence ? 'border-red-400 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-indigo-500'}`}
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <textarea
                        placeholder="Yêu cầu khắc phục..."
                        value={ans.corrective_action}
                        disabled={disabledAction}
                        onChange={(e) => handleTextChange(c.id, 'corrective_action', e.target.value)}
                        className="w-full text-sm p-2 border rounded-md min-h-[80px] bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed border-gray-300 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <input
                        type="text"
                        placeholder="Tên nhân sự..."
                        value={ans.action_owner}
                        disabled={disabledAction}
                        onChange={(e) => handleTextChange(c.id, 'action_owner', e.target.value)}
                        className="w-full text-sm p-2 border rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed border-gray-300 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <input
                        type="date"
                        value={ans.due_date}
                        disabled={disabledAction}
                        onChange={(e) => handleTextChange(c.id, 'due_date', e.target.value)}
                        className="w-full text-sm p-2 border rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed border-gray-300 focus:ring-indigo-500"
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
          className="flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-full shadow-lg hover:bg-indigo-700 transition-transform active:scale-95"
        >
          <Save size={20} className="mr-2" />
          Lưu & Đồng Bộ Kết Quả Checklist
        </button>
      </div>
    </div>
  );
}
