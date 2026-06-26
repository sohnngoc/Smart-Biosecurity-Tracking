import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCheck, Truck, Users, Package } from 'lucide-react';

const complianceData = [
  { name: 'Vehicle', Passed: 95, Failed: 5 },
  { name: 'Person', Passed: 80, Failed: 20 },
  { name: 'Supply', Passed: 90, Failed: 10 },
];

export default function DisinfectionCompliance() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: <ShieldCheck />, label: 'Overall Compliance', value: '88%', color: 'text-green-500' },
          { icon: <Truck />, label: 'Vehicle Disinfection', value: '95%', color: 'text-blue-500' },
          { icon: <Users />, label: 'Person Shower Rate', value: '80%', color: 'text-orange-500' },
          { icon: <Package />, label: 'Supply UV Sterilization', value: '90%', color: 'text-purple-500' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className={`p-4 rounded-full bg-gray-50 ${stat.color} mb-3`}>
              {stat.icon}
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-gray-500 font-medium mb-4">Disinfection Pass/Fail by Entity</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={complianceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f9fafb' }} />
              <Bar dataKey="Passed" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="Failed" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
