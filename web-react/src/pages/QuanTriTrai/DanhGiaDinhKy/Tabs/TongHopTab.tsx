import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { ShieldCheck, AlertCircle, ListChecks } from 'lucide-react';

export default function TongHopTab({ farmId }: { farmId: string | undefined }) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!farmId) return;
      const { data } = await supabase
        .from('farm_assessment_dashboard_summary')
        .select('*')
        .eq('farm_id', farmId)
        .single();
      
      setSummary(data);
      setLoading(false);
    };

    fetchSummary();
  }, [farmId]);

  if (loading) return <div className="text-gray-500">Đang tải dữ liệu tổng hợp...</div>;

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <ShieldCheck size={48} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Chưa có dữ liệu đánh giá</h3>
        <p className="mt-1">Trại này chưa thực hiện kỳ đánh giá định kỳ nào.</p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
          Tạo kỳ đánh giá mới
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Điểm ATSH Tổng hợp</div>
          <div className="text-3xl font-bold text-gray-900">{summary.overall_assessment_score}%</div>
          <div className="text-sm font-medium mt-1 text-green-600">{summary.overall_risk_level}</div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Phần cứng</div>
          <div className="text-2xl font-bold text-gray-800">{summary.latest_hardware_score}%</div>
          <div className="text-xs text-gray-500 mt-1">{summary.latest_hardware_risk_level}</div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Phần mềm</div>
          <div className="text-2xl font-bold text-gray-800">{summary.latest_software_score}%</div>
          <div className="text-xs text-gray-500 mt-1">{summary.latest_software_risk_level}</div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">CheckLIST NÁI-HB</div>
          <div className="text-2xl font-bold text-gray-800">{summary.latest_checklist_score}%</div>
          <div className="text-xs text-gray-500 mt-1">{summary.latest_checklist_risk_level}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-red-50 p-6 rounded-xl border border-red-100">
          <div className="flex items-center mb-4">
            <AlertCircle className="text-red-500 mr-2" size={24} />
            <h3 className="text-lg font-bold text-red-900">Rủi ro & Cảnh báo</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
              <span className="text-gray-700">Tiêu chí BẮT BUỘC không đạt</span>
              <span className="font-bold text-red-600">{summary.mandatory_failed_count}</span>
            </div>
            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
              <span className="text-gray-700">Hành động khắc phục đang mở</span>
              <span className="font-bold text-orange-600">{summary.open_corrective_actions}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <div className="flex items-center mb-4">
            <ListChecks className="text-blue-500 mr-2" size={24} />
            <h3 className="text-lg font-bold text-blue-900">Thông tin kỳ đánh giá</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
              <span className="text-gray-700">Kỳ đánh giá gần nhất</span>
              <span className="font-medium text-gray-900">{summary.last_assessment_period || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
              <span className="text-gray-700">Ngày đánh giá</span>
              <span className="font-medium text-gray-900">{summary.last_assessment_date || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
