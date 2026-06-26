import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, RadialBarChart, RadialBar } from 'recharts';
import { AlertTriangle, ShieldAlert, Truck, Users, Activity, Settings, Package, Info, Map as MapIcon } from 'lucide-react';

const trendData = [
  { day: 'T2', score: 95 },
  { day: 'T3', score: 92 },
  { day: 'T4', score: 85 },
  { day: 'T5', score: 88 },
  { day: 'T6', score: 70 },
  { day: 'T7', score: 65 },
  { day: 'CN', score: 45 },
];

const contributorsData = [
  { name: 'Vehicle', value: 35 },
  { name: 'People', value: 25 },
  { name: 'Cleaning', value: 20 },
  { name: 'Supply', value: 15 },
  { name: 'Device', value: 5 },
];

export default function RiskCommandCenter() {
  const currentScore = 45;
  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };
  
  const getRiskLabel = (score: number) => {
    if (score >= 80) return 'Safe (An toàn)';
    if (score >= 60) return 'Warning (Cảnh báo)';
    if (score >= 40) return 'High Risk (Rủi ro cao)';
    return 'Critical (Nguy hiểm)';
  };

  const riskData = [{ name: 'Score', value: currentScore, fill: currentScore >= 80 ? '#22c55e' : currentScore >= 60 ? '#eab308' : currentScore >= 40 ? '#f97316' : '#ef4444' }];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Risk Score Gauge */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
          <h3 className="text-gray-500 font-medium mb-2">Biosecurity Risk Score</h3>
          <div className="relative w-48 h-48 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" cy="50%" 
                innerRadius="70%" outerRadius="100%" 
                barSize={20} 
                data={riskData} 
                startAngle={180} endAngle={0}
              >
                <RadialBar background dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center" style={{ top: '45%' }}>
              <span className={`text-4xl font-bold ${getRiskColor(currentScore)}`}>{currentScore}</span>
              <span className="text-xs text-gray-400">/ 100</span>
            </div>
          </div>
          <div className={`mt-0 px-4 py-1.5 rounded-full font-bold text-sm bg-opacity-10 ${getRiskColor(currentScore).replace('text', 'bg')} ${getRiskColor(currentScore)}`}>
            {getRiskLabel(currentScore)}
          </div>
        </div>

        {/* Trend Line Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2 flex flex-col">
          <h3 className="text-gray-500 font-medium mb-4">Risk Score Trend (7 days)</h3>
          <div className="flex-1 w-full min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Breakdown Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { icon: <ShieldAlert size={20}/>, label: 'Critical Alerts', value: 3, color: 'text-red-500', bg: 'bg-red-50' },
          { icon: <Truck size={20}/>, label: 'Vehicle Risk', value: 12, color: 'text-orange-500', bg: 'bg-orange-50' },
          { icon: <Users size={20}/>, label: 'People Risk', value: 8, color: 'text-yellow-500', bg: 'bg-yellow-50' },
          { icon: <Activity size={20}/>, label: 'Cleaning', value: 4, color: 'text-blue-500', bg: 'bg-blue-50' },
          { icon: <Package size={20}/>, label: 'Supply Risk', value: 2, color: 'text-purple-500', bg: 'bg-purple-50' },
          { icon: <Settings size={20}/>, label: 'Device Offline', value: 2, color: 'text-gray-500', bg: 'bg-gray-100' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className={`p-3 rounded-full ${stat.bg} ${stat.color} mb-3`}>
              {stat.icon}
            </div>
            <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
            <span className="text-xs text-gray-500 mt-1">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Risk Contributors */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-gray-500 font-medium mb-4 flex items-center">
            Top Risk Contributors <Info size={14} className="ml-2 text-gray-400" />
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contributorsData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563' }} width={80} />
                <RechartsTooltip cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="value" fill="#f87171" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h3 className="text-gray-500 font-medium mb-4 flex items-center justify-between">
            <span>Priority Alerts</span>
            <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">View All</span>
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {[
              { time: '10 mins ago', type: 'Critical', msg: 'Người không có thẻ quẹt xâm nhập khu vực chuồng Đẻ 1.', zone: 'Chuồng Đẻ 1' },
              { time: '1 hour ago', type: 'Critical', msg: 'Xe cám số 2 đi vào khu vực sản xuất nhưng chưa có log sát trùng.', zone: 'Cổng chính' },
              { time: '2 hours ago', type: 'High', msg: 'UWB góc 1 chuồng Đẻ 3 mất kết nối quá thời gian quy định.', zone: 'Chuồng Đẻ 3' },
            ].map((alert, idx) => (
              <div key={idx} className="flex p-3 border rounded-lg border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="mr-3 mt-1">
                  <AlertTriangle size={18} className={alert.type === 'Critical' ? 'text-red-500' : 'text-orange-500'} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-gray-800 leading-tight">{alert.msg}</h4>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{alert.time}</span>
                  </div>
                  <div className="mt-2 flex items-center">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${alert.type === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {alert.type}
                    </span>
                    <span className="text-xs text-gray-500 ml-2 flex items-center">
                      <MapIcon size={12} className="mr-1" /> {alert.zone}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
