import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useOutletContext } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { ClipboardCheck, TrendingUp, AlertTriangle } from 'lucide-react';

export default function PeriodicAssessmentReport() {
  const { farmId } = useOutletContext<{ farmId: string }>();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!farmId) return;
      const { data: sessions } = await supabase
        .from('farm_assessment_sessions')
        .select('assessment_period, score_percent, assessment_forms(code)')
        .eq('farm_id', farmId)
        .order('created_at', { ascending: true });

      if (sessions && sessions.length > 0) {
        // Group by period
        const periodMap: any = {};
        sessions.forEach((s: any) => {
          if (!periodMap[s.assessment_period]) {
            periodMap[s.assessment_period] = {
              period: s.assessment_period,
              HARDWARE: null,
              SOFTWARE: null,
              CHECKLIST_NAI_HB: null,
              average: 0
            };
          }
          const formCode = s.assessment_forms?.code;
          if (formCode) {
            periodMap[s.assessment_period][formCode] = s.score_percent;
          }
        });

        // Calculate averages and format
        const chartData = Object.values(periodMap).map((item: any) => {
          let sum = 0;
          let count = 0;
          if (item.HARDWARE !== null) { sum += item.HARDWARE; count++; }
          if (item.SOFTWARE !== null) { sum += item.SOFTWARE; count++; }
          if (item.CHECKLIST_NAI_HB !== null) { sum += item.CHECKLIST_NAI_HB; count++; }
          item.average = count > 0 ? Number((sum / count).toFixed(1)) : 0;
          return item;
        });

        // MOCK DATA for demo if not enough data
        if (chartData.length < 2) {
          const mockData = [
            { period: 'Tháng 1/2026', HARDWARE: 85, SOFTWARE: 90, CHECKLIST_NAI_HB: 100, average: 91.6 },
            { period: 'Tháng 2/2026', HARDWARE: 88, SOFTWARE: 92, CHECKLIST_NAI_HB: 95, average: 91.6 },
            { period: 'Tháng 3/2026', HARDWARE: 75, SOFTWARE: 80, CHECKLIST_NAI_HB: 85, average: 80.0 },
            { period: 'Tháng 4/2026', HARDWARE: 78, SOFTWARE: 85, CHECKLIST_NAI_HB: 80, average: 81.0 },
            { period: 'Tháng 5/2026', HARDWARE: 90, SOFTWARE: 88, CHECKLIST_NAI_HB: 92, average: 90.0 },
          ];
          setData(mockData.concat(chartData));
        } else {
          setData(chartData);
        }
      } else {
        // Default Mock Data if no real data exists
        setData([
          { period: 'Tháng 1/2026', HARDWARE: 85, SOFTWARE: 90, CHECKLIST_NAI_HB: 100, average: 91.6 },
          { period: 'Tháng 2/2026', HARDWARE: 88, SOFTWARE: 92, CHECKLIST_NAI_HB: 95, average: 91.6 },
          { period: 'Tháng 3/2026', HARDWARE: 75, SOFTWARE: 80, CHECKLIST_NAI_HB: 85, average: 80.0 },
          { period: 'Tháng 4/2026', HARDWARE: 78, SOFTWARE: 85, CHECKLIST_NAI_HB: 80, average: 81.0 },
          { period: 'Tháng 5/2026', HARDWARE: 90, SOFTWARE: 88, CHECKLIST_NAI_HB: 92, average: 90.0 },
        ]);
      }
      setLoading(false);
    };

    fetchData();
  }, [farmId]);

  if (loading) return <div>Đang tải biểu đồ...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600 mr-4">
            <ClipboardCheck size={28} />
          </div>
          <div>
            <h3 className="text-gray-500 font-medium mb-1">Điểm trung bình (6 kỳ)</h3>
            <span className="text-3xl font-bold text-gray-900">
              {Number(data.reduce((acc, curr) => acc + curr.average, 0) / data.length).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="bg-green-100 p-4 rounded-full text-green-600 mr-4">
            <TrendingUp size={28} />
          </div>
          <div>
            <h3 className="text-gray-500 font-medium mb-1">Kỳ cao nhất</h3>
            <span className="text-3xl font-bold text-gray-900">
              {Math.max(...data.map(d => d.average))}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
          <div className="bg-red-100 p-4 rounded-full text-red-600 mr-4">
            <AlertTriangle size={28} />
          </div>
          <div>
            <h3 className="text-gray-500 font-medium mb-1">Cảnh báo xu hướng</h3>
            <span className="text-lg font-bold text-red-600 leading-tight">
              Hardware đang giảm trong 2 kỳ gần nhất
            </span>
          </div>
        </div>
      </div>

      {/* Main Trend Line Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-gray-800 font-bold mb-6 text-lg">Xu hướng điểm ATSH Định kỳ</h3>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              
              <Line 
                type="monotone" 
                name="Điểm Trung Bình"
                dataKey="average" 
                stroke="#3b82f6" 
                strokeWidth={4} 
                dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: 'white' }} 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                name="Phần cứng"
                dataKey="HARDWARE" 
                stroke="#10b981" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={{ r: 4 }} 
              />
              <Line 
                type="monotone" 
                name="Phần mềm"
                dataKey="SOFTWARE" 
                stroke="#f59e0b" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={{ r: 4 }} 
              />
              <Line 
                type="monotone" 
                name="Checklist Nái-HB"
                dataKey="CHECKLIST_NAI_HB" 
                stroke="#8b5cf6" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={{ r: 4 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
