import { Package, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function SupplyBiosecurity() {
  const supplies = [
    { batch: 'SUP-001', type: 'Thuốc thú y', supplier: 'Công ty A', status: 'Approved', zone: 'Kho thuốc' },
    { batch: 'SUP-002', type: 'Cám heo', supplier: 'Công ty B', status: 'Pending', zone: 'Khu sát trùng' },
    { batch: 'SUP-003', type: 'Dụng cụ y tế', supplier: 'Công ty C', status: 'Quarantined', zone: 'Cổng chính' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Package />, label: 'Total Batches', value: 156, bg: 'bg-blue-50', color: 'text-blue-500' },
          { icon: <CheckCircle />, label: 'Approved', value: 142, bg: 'bg-green-50', color: 'text-green-500' },
          { icon: <AlertTriangle />, label: 'Pending Disinfection', value: 12, bg: 'bg-yellow-50', color: 'text-yellow-500' },
          { icon: <XCircle />, label: 'Quarantined', value: 2, bg: 'bg-red-50', color: 'text-red-500' },
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
          <h3 className="font-bold text-gray-800">Recent Supply Batches</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
            <tr>
              <th className="p-4">Batch Code</th>
              <th className="p-4">Loại vật tư</th>
              <th className="p-4">Nhà cung cấp</th>
              <th className="p-4">Khu vực hiện tại</th>
              <th className="p-4">Trạng thái phê duyệt</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {supplies.map((sup, idx) => (
              <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-bold text-gray-700">{sup.batch}</td>
                <td className="p-4 text-gray-600">{sup.type}</td>
                <td className="p-4 text-gray-600">{sup.supplier}</td>
                <td className="p-4 text-gray-600">{sup.zone}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    sup.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    sup.status === 'Quarantined' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {sup.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
