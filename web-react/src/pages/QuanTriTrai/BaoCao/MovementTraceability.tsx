import { Truck, User, MapPin, ArrowRight, ShieldAlert } from 'lucide-react';

export default function MovementTraceability() {
  const traces = [
    { time: '08:15', entity: 'Xe cám biển số 51C-123.45', type: 'vehicle', from: 'Cổng chính', to: 'Khu sát trùng', status: 'authorized' },
    { time: '08:45', entity: 'Xe cám biển số 51C-123.45', type: 'vehicle', from: 'Khu sát trùng', to: 'Kho cám', status: 'authorized' },
    { time: '09:30', entity: 'Nguyễn Văn A (Công nhân)', type: 'person', from: 'Nhà ăn', to: 'Chuồng Đẻ 1', status: 'violation', alert: 'Chưa qua khu tắm sát trùng' },
    { time: '09:45', entity: 'Nguyễn Văn A (Công nhân)', type: 'person', from: 'Chuồng Đẻ 1', to: 'Kho thuốc', status: 'authorized' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-gray-800 font-bold">Movement Timeline & Violations</h3>
          <input type="text" placeholder="Tìm kiếm RFID, Biển số xe..." className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
        </div>
        
        <div className="relative border-l-2 border-gray-200 ml-3 md:ml-6 space-y-8">
          {traces.map((trace, idx) => (
            <div key={idx} className="relative pl-8">
              <div className={`absolute -left-[13px] top-1 rounded-full p-1 border-4 border-white ${trace.status === 'violation' ? 'bg-red-500' : 'bg-blue-500'}`}>
                {trace.type === 'vehicle' ? <Truck size={12} className="text-white"/> : <User size={12} className="text-white"/>}
              </div>
              <div className="flex flex-col md:flex-row md:items-center">
                <span className="text-sm font-bold text-gray-500 w-16">{trace.time}</span>
                <div className={`flex-1 p-4 rounded-lg border ${trace.status === 'violation' ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800">{trace.entity}</span>
                    {trace.status === 'violation' && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold flex items-center"><ShieldAlert size={12} className="mr-1"/> Violation</span>}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mt-2">
                    <MapPin size={14} className="mr-1" /> {trace.from} 
                    <ArrowRight size={14} className="mx-2 text-gray-400" />
                    <MapPin size={14} className="mr-1" /> {trace.to}
                  </div>
                  {trace.alert && <div className="mt-2 text-xs text-red-600 font-medium">Lỗi: {trace.alert}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
