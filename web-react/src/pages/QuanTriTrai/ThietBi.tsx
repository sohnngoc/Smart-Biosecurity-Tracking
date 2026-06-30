import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Fingerprint, Search, Wifi, WifiOff, Battery, Clock, ArrowLeft, Shield, History, UserPlus, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export const generateMockDevices = () => []; // Stub for TongQuanTrai

interface Device {
  id: string;
  device_name: string;
  device_serial: string;
  status: string;
  last_seen: string;
  firmware_version: string;
  battery_level: number | null;
  checkpoints: { checkpoint_name: string; checkpoint_type: string };
}

export default function ThietBi() {
  const { farmId } = useOutletContext<{ farmId: string }>();
  const [devices, setDevices] = useState<Device[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [activeTab, setActiveTab] = useState<'permissions' | 'logs' | 'register'>('permissions');

  // Scanning simulation states
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanSuccess, setScanSuccess] = useState(false);
  const scanIntervalRef = useRef<any>(null);

  // Mock data for the device modal
  const mockPermissions = [
    { id: 1, name: 'Nguyễn Văn A', title: 'Kỹ thuật viên', allowed: true },
    { id: 2, name: 'Trần Thị B', title: 'Công nhân vệ sinh', allowed: true },
    { id: 3, name: 'Lê Văn C', title: 'Bảo vệ', allowed: false },
    { id: 4, name: 'Phạm Thị D', title: 'Quản lý', allowed: true },
  ];

  const mockLogs = [
    { id: 1, name: 'Nguyễn Văn A', time: '10:05 AM - Hôm nay', status: 'Hợp lệ' },
    { id: 2, name: 'Lê Văn C', time: '09:30 AM - Hôm nay', status: 'Từ chối' },
    { id: 3, name: 'Trần Thị B', time: '08:15 AM - Hôm nay', status: 'Hợp lệ' },
    { id: 4, name: 'Phạm Thị D', time: '16:45 PM - Hôm qua', status: 'Hợp lệ' },
  ];

  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanSuccess(false);

    scanIntervalRef.current = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(scanIntervalRef.current);
          setIsScanning(false);
          setScanSuccess(true);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 500);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (farmId) fetchDevices();
  }, [farmId]);

  const fetchDevices = async () => {
    const { data } = await supabase
      .from('finger_scan_devices')
      .select(`
        *,
        checkpoints (checkpoint_name, checkpoint_type)
      `)
      .eq('farm_id', farmId)
      .order('device_name');

    if (data) setDevices(data as any);
  };

  const filteredDevices = devices.filter(d => 
    d.device_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.device_serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.checkpoints?.checkpoint_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedDevice) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <button onClick={() => setSelectedDevice(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-500">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
              Quản trị thiết bị: {selectedDevice.device_name}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Serial: {selectedDevice.device_serial} | Vị trí: {selectedDevice.checkpoints?.checkpoint_name || 'Chưa gắn'}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex items-center px-4 py-3 font-medium text-sm border-b-2 transition ${activeTab === 'permissions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <Shield size={18} className="mr-2"/> Cấp quyền vân tay
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center px-4 py-3 font-medium text-sm border-b-2 transition ${activeTab === 'register' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <UserPlus size={18} className="mr-2"/> Đăng ký vân tay mới
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center px-4 py-3 font-medium text-sm border-b-2 transition ${activeTab === 'logs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <History size={18} className="mr-2"/> Lịch sử quét
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'permissions' ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Danh sách cấp quyền truy cập</h3>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition">Đồng bộ thiết bị</button>
            </div>
            <div className="space-y-3">
              {mockPermissions.map(p => (
                <div key={p.id} className="flex justify-between items-center p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-200">{p.name}</h4>
                    <p className="text-sm text-gray-500">{p.title}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={p.allowed} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'register' ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Đăng ký vân tay cho nhân sự</h3>
            
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chọn nhân sự cần đăng ký</label>
                <select className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-white">
                  <option value="">-- Vui lòng chọn nhân sự --</option>
                  <option value="1">Lý Văn E - Kỹ thuật viên</option>
                  <option value="2">Vũ Thị F - Công nhân vệ sinh</option>
                  <option value="3">Đỗ Văn G - Bảo vệ</option>
                </select>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                <div className={`relative w-24 h-24 mb-6 flex items-center justify-center rounded-full transition-all duration-500 ${isScanning ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)]' : scanSuccess ? 'bg-green-100 dark:bg-green-900/30 text-green-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                  {scanSuccess ? (
                    <CheckCircle2 size={48} className="animate-in zoom-in duration-300" />
                  ) : (
                    <Fingerprint size={48} className={isScanning ? 'animate-pulse' : ''} />
                  )}
                  {isScanning && (
                    <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>

                <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  {isScanning ? 'Đang lấy mẫu vân tay...' : scanSuccess ? 'Đăng ký thành công!' : 'Sẵn sàng đăng ký'}
                </h4>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                  {isScanning 
                    ? `Vui lòng yêu cầu nhân viên đặt tay lên thiết bị và giữ nguyên. Quá trình: ${scanProgress}%` 
                    : scanSuccess 
                    ? 'Dữ liệu vân tay đã được đồng bộ xuống thiết bị và lưu trữ an toàn trên hệ thống.' 
                    : 'Yêu cầu thiết bị chuyển sang chế độ đăng ký và bắt đầu quét vân tay.'}
                </p>

                {isScanning ? (
                  <div className="w-full max-w-xs h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500 ease-out" 
                      style={{ width: `${scanProgress}%` }}
                    ></div>
                  </div>
                ) : scanSuccess ? (
                  <button 
                    onClick={() => { setScanSuccess(false); setScanProgress(0); }}
                    className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-xl transition"
                  >
                    Đăng ký người khác
                  </button>
                ) : (
                  <button 
                    onClick={handleStartScan}
                    className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition shadow-lg shadow-blue-500/30"
                  >
                    <Fingerprint size={18} className="mr-2" />
                    Bắt đầu quét trên thiết bị
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Nhật ký quét vân tay gần đây</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border-b dark:border-gray-700">
                    <th className="px-4 py-3 rounded-tl-lg font-semibold">Nhân sự</th>
                    <th className="px-4 py-3 font-semibold">Thời gian</th>
                    <th className="px-4 py-3 rounded-tr-lg font-semibold">Kết quả</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {mockLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-750/50 transition">
                      <td className="px-4 py-4 font-medium text-gray-800 dark:text-gray-200">{log.name}</td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{log.time}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${log.status === 'Hợp lệ' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <Fingerprint className="mr-3 text-blue-600 dark:text-blue-400" size={28} />
            Quản lý thiết bị Finger Scan
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Trạng thái kết nối của các thiết bị đọc vân tay</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Tìm kiếm thiết bị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDevices.map(device => (
          <div 
            key={device.id} 
            onClick={() => setSelectedDevice(device)}
            className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${device.status === 'online' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  <Fingerprint size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white">{device.device_name}</h3>
                  <p className="text-xs text-gray-500">{device.device_serial}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center ${
                device.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {device.status === 'online' ? <Wifi size={12} className="mr-1"/> : <WifiOff size={12} className="mr-1"/>}
                {device.status === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Vị trí:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{device.checkpoints?.checkpoint_name || 'Chưa gắn'}</span>
              </div>
              <div className="flex justify-between">
                <span>Trạm (Type):</span>
                <span className="font-medium text-gray-800 dark:text-gray-200 uppercase">{device.checkpoints?.checkpoint_type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Hoạt động cuối:</span>
                <span className="flex items-center text-xs"><Clock size={12} className="mr-1"/> {new Date(device.last_seen).toLocaleTimeString('vi-VN')}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t dark:border-gray-700 mt-2">
                <span className="text-xs">FW: {device.firmware_version || '1.0.0'}</span>
                {device.battery_level !== null && (
                  <span className="flex items-center text-xs text-green-600">
                    <Battery size={14} className="mr-1" /> {device.battery_level}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredDevices.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-500">
            Không tìm thấy thiết bị nào.
          </div>
        )}
      </div>
    </div>
  );
}
