import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, TrendingUp, AlertTriangle } from 'lucide-react';

const benchmarkData = [
  { name: 'Trại Đồng Nai', score: 92 },
  { name: 'Trại Bình Dương', score: 85 },
  { name: 'Trại Long An', score: 78 },
  { name: 'Trại Tây Ninh', score: 65 },
  { name: 'Trại Vũng Tàu', score: 45 },
];

export default function FarmBenchmark() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <Trophy />, label: 'Top Performing Farm', value: 'Trại Đồng Nai', desc: '92/100 points', bg: 'bg-yellow-50', color: 'text-yellow-500' },
          { icon: <TrendingUp />, label: 'Most Improved', value: 'Trại Long An', desc: '+15 points this month', bg: 'bg-green-50', color: 'text-green-500' },
          { icon: <AlertTriangle />, label: 'Needs Attention', value: 'Trại Vũng Tàu', desc: 'Critical risk score', bg: 'bg-red-50', color: 'text-red-500' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start">
            <div className={`p-4 rounded-full ${stat.bg} ${stat.color} mr-4 mt-1`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <h3 className="text-xl font-bold text-gray-800 mt-1">{stat.value}</h3>
              <p className="text-xs font-medium text-gray-600 mt-2">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-gray-500 font-medium mb-4">Biosecurity Score Benchmark Across Farms</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={benchmarkData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f9fafb' }} />
              <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={50}>
                {benchmarkData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.score >= 80 ? '#22c55e' : entry.score >= 60 ? '#eab308' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
