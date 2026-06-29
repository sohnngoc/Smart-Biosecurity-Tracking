import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Fingerprint, Search, Wifi, WifiOff, Battery, Clock } from 'lucide-react';
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
          <div key={device.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
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
