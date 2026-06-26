import { Settings, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';

export default function DeviceHealthReport() {
  const devices = [
    { name: 'UWB Cách ly', type: 'UWB', zone: 'Cách ly', status: 'Offline', downtime: '2h 15m' },
    { name: 'RFID Cửa Đẻ 3', type: 'RFID', zone: 'Chuồng Đẻ 3', status: 'Offline', downtime: '45m' },
    { name: 'GPS Base Station', type: 'GPS', zone: 'Cổng chính', status: 'Online', downtime: '0m' },
    { name: 'UWB Sát trùng xe', type: 'UWB', zone: 'Khu sát trùng', status: 'Online', downtime: '0m' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Settings />, label: 'Total Devices', value: 45, bg: 'bg-blue-50', color: 'text-blue-500' },
          { icon: <CheckCircle />, label: 'Online', value: 43, bg: 'bg-green-50', color: 'text-green-500' },
          { icon: <WifiOff />, label: 'Offline', value: 2, bg: 'bg-red-50', color: 'text-red-500' },
          { icon: <AlertTriangle />, label: 'Blind Spots', value: 1, bg: 'bg-orange-50', color: 'text-orange-500' },
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Offline Devices & Blind Spots</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
            <tr>
              <th className="p-4">Thiết bị</th>
              <th className="p-4">Khu vực</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Thời gian mất kết nối</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {devices.map((device, idx) => (
              <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-bold text-gray-700">{device.name} <span className="text-xs font-normal text-gray-400 ml-2">{device.type}</span></td>
                <td className="p-4 text-gray-600">{device.zone}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    device.status === 'Online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 animate-pulse'
                  }`}>
                    {device.status}
                  </span>
                </td>
                <td className="p-4 text-gray-600 font-medium">{device.downtime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
