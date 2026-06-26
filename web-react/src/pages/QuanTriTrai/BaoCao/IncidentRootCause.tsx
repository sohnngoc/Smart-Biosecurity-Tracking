import { FileText, DownloadCloud, ShieldAlert } from 'lucide-react';

export default function IncidentRootCause() {
  const incidents = [
    { id: 'INC-2023-001', date: '2023-10-25', title: 'Xâm nhập trái phép Chuồng Đẻ 1', rootCause: 'Nhân viên không tuân thủ quy trình quẹt thẻ và tắm sát trùng', status: 'Closed' },
    { id: 'INC-2023-002', date: '2023-10-26', title: 'Xe cám bỏ qua trạm sát trùng', rootCause: 'Tài xế mới chưa được đào tạo', status: 'Investigating' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-end mb-4">
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <DownloadCloud size={16} className="mr-2" />
          Export All Reports
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {incidents.map((inc, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-start">
              <div className="p-3 bg-red-50 text-red-500 rounded-full mr-4 mt-1">
                <ShieldAlert size={24} />
              </div>
              <div>
                <div className="flex items-center">
                  <h3 className="font-bold text-gray-800 text-lg mr-3">{inc.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    inc.status === 'Closed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {inc.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">ID: {inc.id} | Date: {inc.date}</p>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase">Nguyên nhân gốc rễ (Root Cause):</span>
                  <p className="text-sm text-gray-700 mt-1">{inc.rootCause}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col items-end">
              <button className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                <FileText size={16} className="mr-1" /> View Full Report
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
