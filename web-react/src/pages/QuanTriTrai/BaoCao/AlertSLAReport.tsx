import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';

const alertData = [
  { name: 'Mon', Critical: 2, High: 5, Medium: 10 },
  { name: 'Tue', Critical: 0, High: 3, Medium: 8 },
  { name: 'Wed', Critical: 1, High: 4, Medium: 12 },
  { name: 'Thu', Critical: 3, High: 6, Medium: 15 },
  { name: 'Fri', Critical: 0, High: 2, Medium: 9 },
  { name: 'Sat', Critical: 0, High: 1, Medium: 5 },
  { name: 'Sun', Critical: 0, High: 0, Medium: 3 },
];

const slaData = [
  { name: 'Met SLA', value: 85 },
  { name: 'Overdue', value: 15 },
];
const COLORS = ['#22c55e', '#ef4444'];

export default function AlertSLAReport() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <AlertTriangle />, label: 'Total Alerts', value: 124, color: 'text-blue-500', bg: 'bg-blue-50' },
          { icon: <Clock />, label: 'Avg Resolution Time', value: '45m', color: 'text-orange-500', bg: 'bg-orange-50' },
          { icon: <CheckCircle />, label: 'SLA Compliance', value: '85%', color: 'text-green-500', bg: 'bg-green-50' },
          { icon: <XCircle />, label: 'Overdue Alerts', value: 18, color: 'text-red-500', bg: 'bg-red-50' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className={`p-3 rounded-full ${stat.bg} ${stat.color} mr-4`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2">
          <h3 className="text-gray-500 font-medium mb-4">Alerts by Severity (7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="Critical" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
                <Bar dataKey="High" stackId="a" fill="#f97316" />
                <Bar dataKey="Medium" stackId="a" fill="#eab308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
          <h3 className="text-gray-500 font-medium mb-4 w-full text-left">SLA Performance</h3>
          <div className="w-full flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={slaData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {slaData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex w-full justify-center space-x-6 mt-4">
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div><span className="text-sm text-gray-600">Met SLA</span></div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div><span className="text-sm text-gray-600">Overdue</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
