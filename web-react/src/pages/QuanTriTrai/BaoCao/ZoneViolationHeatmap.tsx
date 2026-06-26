import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Map, AlertTriangle } from 'lucide-react';

const zoneData = [
  { name: 'Cổng chính', violations: 12 },
  { name: 'Khu sát trùng', violations: 5 },
  { name: 'Chuồng Đẻ 1', violations: 18 },
  { name: 'Chuồng Đẻ 3', violations: 4 },
  { name: 'Kho cám', violations: 2 },
  { name: 'Kho thuốc', violations: 8 },
];

export default function ZoneViolationHeatmap() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
          <Map size={48} className="text-gray-300 mb-4" />
          <h3 className="font-bold text-gray-800 mb-2">Bản đồ nhiệt khu vực (Heatmap)</h3>
          <p className="text-gray-500 text-center text-sm">
            Tính năng Overlay Bản đồ nhiệt 3D đang được tích hợp vào công cụ Bản Đồ Nội Bộ. <br/>Vui lòng xem thống kê khu vực bên cạnh.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <AlertTriangle className="mr-2 text-orange-500" size={20} />
            Top Risky Zones
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="violations" fill="#f87171" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
