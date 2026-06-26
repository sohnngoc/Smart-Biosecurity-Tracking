import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { FileText, Download } from 'lucide-react';

export default function LichSuTab({ farmId }: { farmId: string | undefined }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!farmId) return;
      const { data } = await supabase
        .from('farm_assessment_sessions')
        .select('*, assessment_forms(name)')
        .eq('farm_id', farmId)
        .order('assessment_date', { ascending: false });
      
      if (data) setSessions(data);
      setLoading(false);
    };

    fetchHistory();
  }, [farmId]);

  if (loading) return <div>Đang tải lịch sử...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Lịch sử đánh giá định kỳ</h3>
        <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          <Download size={16} className="mr-2" /> Xuất dữ liệu
        </button>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kỳ đánh giá</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đánh giá</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại Form</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm %</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mức rủi ro</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Chưa có dữ liệu đánh giá nào
                </td>
              </tr>
            ) : (
              sessions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.assessment_period}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.assessment_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.assessment_forms?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{s.score_percent}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      s.risk_level === 'Nguy cơ cao' ? 'bg-red-100 text-red-800' :
                      s.risk_level === 'Nguy cơ trung bình' ? 'bg-orange-100 text-orange-800' :
                      s.risk_level === 'Nguy cơ thấp' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {s.risk_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 flex items-center justify-end w-full">
                      <FileText size={16} className="mr-1" /> Chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
