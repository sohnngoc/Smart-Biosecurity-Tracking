import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, LayersControl, ZoomControl, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LogOut, RefreshCw, Settings, X, Save, Plus, Trash2, Play, ChevronDown, RotateCcw, AlertTriangle, Info, Moon, Sun, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Cấu hình Icon Marker tùy chỉnh nổi bật và động theo màu trạng thái
const getMarkerIcon = (status: string) => {
  let colorClass = 'bg-orange-500';
  let borderClass = 'bg-orange-600';
  
  if (status === 'An toàn') {
    colorClass = 'bg-green-500';
    borderClass = 'bg-green-600';
  } else if (status === 'Rủi ro cao') {
    colorClass = 'bg-red-500';
    borderClass = 'bg-red-600';
  } else if (status === 'Rủi ro') {
    colorClass = 'bg-orange-500';
    borderClass = 'bg-orange-600';
  } else if (status === 'Cần chú ý') {
    colorClass = 'bg-yellow-500';
    borderClass = 'bg-yellow-600';
  }

  return new L.DivIcon({
    className: 'bg-transparent',
    html: `
      <div class="relative flex items-center justify-center w-10 h-10 -ml-5 -mt-5">
        <div class="absolute inline-flex w-8 h-8 ${colorClass} rounded-full opacity-60 animate-ping"></div>
        <div class="relative inline-flex items-center justify-center w-5 h-5 ${borderClass} border-[3px] border-white rounded-full shadow-[0_0_10px_rgba(0,0,0,0.8)]"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

// Icon mô phỏng Bác sĩ thú y (Person) di chuyển
const getPersonIcon = () => {
  return new L.DivIcon({
    className: 'bg-transparent',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 -ml-4 -mt-4 bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.8)] border-2 border-white z-1000 animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

// Icon mô phỏng Xe tải (Truck) di chuyển
const getTruckIcon = () => {
  return new L.DivIcon({
    className: 'bg-transparent',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 -ml-4 -mt-4 bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.8)] border-2 border-gray-900 z-1000 animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 17h4V5H2v12h3"></path>
          <path d="M20 17h2v-9l-2-2h-3v11h1"></path>
          <circle cx="7.5" cy="17.5" r="2.5"></circle>
          <circle cx="17.5" cy="17.5" r="2.5"></circle>
        </svg>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

function MovingMarker({ start, end, duration, iconType, onComplete }: { start: [number, number], end: [number, number], duration: number, iconType: 'person' | 'truck', onComplete: () => void }) {
  const [pos, setPos] = useState<[number, number]>(start);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      const currentLat = start[0] + (end[0] - start[0]) * progress;
      const currentLng = start[1] + (end[1] - start[1]) * progress;
      
      setPos([currentLat, currentLng]);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        onComplete();
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [start, end, duration, onComplete]);

  return <Marker position={pos} icon={iconType === 'truck' ? getTruckIcon() : getPersonIcon()} zIndexOffset={1000} />;
}

function MapUpdater({ farms }: { farms: any[] }) {
  const map = useMap();
  useEffect(() => {
    if (farms && farms.length > 0) {
      const bounds = L.latLngBounds(farms.map(f => [f.latitude || 11.2, f.longitude || 106.5]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [farms, map]);
  return null;
}

export default function BanDoTongQuan() {
  const { t, i18n } = useTranslation();
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleDarkMode = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFarm, setEditingFarm] = useState<any>(null);
  const [editForm, setEditForm] = useState({ 
    farm_name: '', farm_code: '', location_name: '', province: '', district: '', 
    biosecurity_level: '', overall_status: '', risk_score: 0, latitude: 0, longitude: 0 
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const [showSimMenu, setShowSimMenu] = useState(false);
  const [simToast, setSimToast] = useState<{msg: string, type: 'error'|'warning', farmName: string} | null>(null);
  
  // State quản lý animation S1/S2
  const [activeSimulation, setActiveSimulation] = useState<{
    type: 'S1' | 'S2',
    farmA: any,
    farmB: any,
  } | null>(null);

  const triggerSimulationComplete = async (type: 'S1' | 'S2', farmA: any, farmB: any) => {
    setActiveSimulation(null);
    let payload = {};
    let toastMsg = '';

    if (type === 'S1') {
      payload = { overall_status: 'Rủi ro cao', risk_score: 55, active_alert_count: farmB.active_alert_count + 1 };
      toastMsg = `Phát hiện Bác sĩ thú y vi phạm quy trình cách ly 48h di chuyển từ ${farmA.farm_name} sang ${farmB.farm_name}`;
      setSimToast({ msg: toastMsg, type: 'error', farmName: farmB.farm_name });
    } else {
      payload = { overall_status: 'Rủi ro', risk_score: 75 };
      toastMsg = `Cảnh báo: Xe vận chuyển cám từ ${farmA.farm_name} đang tiến vào ${farmB.farm_name}`;
      setSimToast({ msg: toastMsg, type: 'warning', farmName: farmB.farm_name });
    }
    
    await supabase.from('farms').update(payload).eq('id', farmB.id);
    await fetchFarms();
    setTimeout(() => setSimToast(null), 8000);
  };

  const runGlobalScenario = async (type: 'S1' | 'S2') => {
    setShowSimMenu(false);
    if (farms.length < 2) {
      alert("Cần ít nhất 2 trại để chạy mô phỏng liên trại!");
      return;
    }
    
    // Pick 2 random distinct farms
    const shuffled = [...farms].sort(() => 0.5 - Math.random());
    const farmA = shuffled[0];
    const farmB = shuffled[1];
    
    // Kích hoạt animation
    setActiveSimulation({ type, farmA, farmB });
  };

  const resetGlobalSimulation = async () => {
    setShowSimMenu(false);
    // Reset all farms to Safe
    await supabase.from('farms').update({ overall_status: 'An toàn', risk_score: 95, active_alert_count: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
    setSimToast(null);
    await fetchFarms();
  };

  const fetchFarms = async () => {
    setLoading(true);
    const { data } = await supabase.from('farms').select('*').order('farm_code', { ascending: true });
    if (data) {
      const syncedData = data.map(farm => {
        let status = 'Rủi ro cao';
        const score = farm.risk_score || 0;
        if (score > 90) status = 'An toàn';
        else if (score >= 80) status = 'Cần chú ý';
        else if (score >= 70) status = 'Rủi ro';

        // Ưu tiên giữ nguyên 'Rủi ro cao' nếu do lỗi Checklist bắt buộc hoặc do kịch bản Mô phỏng S1 ép xuống
        if (farm.overall_status === 'Rủi ro cao') {
          status = 'Rủi ro cao';
        }

        return { ...farm, overall_status: status };
      });
      setFarms(syncedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/dang-nhap');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10 transition-colors duration-300">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('map_title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('map_subtitle')}</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <div className="relative group">
            <button className="flex items-center space-x-1 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition">
              <Globe size={18} />
              <span className="uppercase font-medium">{i18n.language || 'VI'}</span>
            </button>
            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <ul className="py-1">
                <li><button onClick={() => changeLanguage('vi')} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200">Tiếng Việt</button></li>
                <li><button onClick={() => changeLanguage('en')} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200">English</button></li>
                <li><button onClick={() => changeLanguage('th')} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200">ภาษาไทย</button></li>
              </ul>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title="Toggle Dark Mode"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button 
            onClick={() => {
              setEditingFarm({ id: null });
              setEditForm({ 
                farm_name: '', farm_code: `FARM-${Math.floor(Math.random() * 1000)}`, location_name: '', province: '', district: '', 
                biosecurity_level: 'Cấp độ trung bình', overall_status: 'An toàn', risk_score: 95, latitude: 11.2, longitude: 106.5 
              });
            }}
            className="flex items-center bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-sm transition"
          >
            <Plus size={18} className="mr-1" />
            {t('add_farm')}
          </button>
          <button onClick={fetchFarms} className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            <RefreshCw size={18} className="mr-2" />
            {t('refresh')}
          </button>
          <button onClick={handleLogout} className="flex items-center text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-lg">
            <LogOut size={18} className="mr-2" />
            {t('logout')}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-96 bg-white dark:bg-gray-800 shadow-lg overflow-y-auto flex flex-col z-10 border-r dark:border-gray-700 transition-colors duration-300">
          <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <h2 className="font-semibold text-gray-700 dark:text-gray-200">Danh sách trại ({farms.length})</h2>
          </div>
          {loading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">Đang tải dữ liệu...</div>
          ) : (
            <div className="p-2 space-y-2">
              {farms.map((farm) => (
                <div key={farm.id} className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition bg-white dark:bg-gray-800/50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">{farm.farm_name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      farm.overall_status === 'An toàn' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      farm.overall_status === 'Cần chú ý' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      farm.overall_status === 'Rủi ro' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {farm.overall_status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    <p>Mã: {farm.farm_code}</p>
                    <p>Địa điểm: {farm.location_name}</p>
                    <p>Cấp độ: {farm.biosecurity_level}</p>
                    <p className="font-semibold mt-1">Điểm đánh giá ATSH: <span className={
                      farm.risk_score > 90 ? 'text-green-600 dark:text-green-400' :
                      farm.risk_score >= 80 ? 'text-yellow-600 dark:text-yellow-400' :
                      farm.risk_score >= 70 ? 'text-orange-600 dark:text-orange-400' :
                      'text-red-600 dark:text-red-400'
                    }>{farm.risk_score}/100</span></p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        setEditingFarm(farm);
                        setEditForm({ 
                          farm_name: farm.farm_name || '', 
                          farm_code: farm.farm_code || '', 
                          location_name: farm.location_name || '', 
                          province: farm.province || '', 
                          district: farm.district || '', 
                          biosecurity_level: farm.biosecurity_level || '', 
                          overall_status: farm.overall_status || '', 
                          risk_score: farm.risk_score || 0, 
                          latitude: farm.latitude || 0, 
                          longitude: farm.longitude || 0 
                        });
                      }}
                      className="flex-1 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-medium border border-gray-200 dark:border-gray-600 flex items-center justify-center"
                      title="Chỉnh sửa thông tin trại"
                    >
                      <Settings size={16} />
                    </button>
                    <button 
                      onClick={async () => {
                        if (confirm(`Bạn có chắc muốn xóa trại "${farm.farm_name}" không? Toàn bộ dữ liệu liên quan sẽ bị xóa.`)) {
                          const { error } = await supabase.from('farms').delete().eq('id', farm.id);
                          if (!error) fetchFarms();
                          else alert('Lỗi khi xóa: ' + error.message);
                        }
                      }}
                      className="px-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 py-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition text-sm font-medium border border-red-100 dark:border-red-900/50 flex items-center justify-center"
                      title="Xóa trại"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button 
                      onClick={() => navigate(`/trai/${farm.farm_code}/tong-quan`)}
                      className="flex-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 py-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition text-sm font-medium"
                    >
                      Vào quản trị trại
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative z-0">
          
          {/* Simulation Floating Menu */}
          <div className="absolute top-16 right-4 z-1000 flex flex-col items-end">
            <button 
              onClick={() => setShowSimMenu(!showSimMenu)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center hover:bg-blue-700 transition"
            >
              <Play size={18} className="mr-2 fill-current" />
              <span className="font-semibold">Run Scenario</span>
              <ChevronDown size={18} className="ml-2" />
            </button>
            
            {showSimMenu && (
              <div className="mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-72 overflow-hidden border border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-2">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-300 text-sm">
                  Global Map Simulations
                </div>
                <button 
                  onClick={() => runGlobalScenario('S1')}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/30 transition border-b dark:border-gray-700 flex items-start group"
                >
                  <AlertTriangle className="text-red-500 mr-3 shrink-0 group-hover:scale-110 transition-transform" size={20} />
                  <div>
                    <div className="font-bold text-gray-800 dark:text-white text-sm">BSTY vi phạm cách ly</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cảnh báo Đỏ (Critical)</div>
                  </div>
                </button>
                <button 
                  onClick={() => runGlobalScenario('S2')}
                  className="w-full text-left px-4 py-3 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition border-b dark:border-gray-700 flex items-start group"
                >
                  <Info className="text-yellow-500 mr-3 shrink-0 group-hover:scale-110 transition-transform" size={20} />
                  <div>
                    <div className="font-bold text-gray-800 dark:text-white text-sm">Xe cám liên trại</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cảnh báo Vàng (Warning)</div>
                  </div>
                </button>
                <button 
                  onClick={resetGlobalSimulation}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center text-gray-600 dark:text-gray-300"
                >
                  <RotateCcw className="mr-3" size={18} />
                  <span className="font-medium text-sm">Reset All Farms</span>
                </button>
              </div>
            )}
          </div>

          {/* Simulation Toast (Bottom Right) */}
          {simToast && (
            <div className="absolute bottom-6 right-6 z-1000 animate-in slide-in-from-right duration-500">
              <div className={`rounded-xl shadow-2xl p-4 flex items-start max-w-md border-l-4 ${
                simToast.type === 'error' ? 'bg-white border-red-500' : 'bg-gray-900 border-yellow-500 text-white'
              }`}>
                {simToast.type === 'error' ? (
                  <AlertTriangle className="text-red-500 mr-3 shrink-0 mt-0.5 animate-pulse" size={28} />
                ) : (
                  <AlertTriangle className="text-yellow-400 mr-3 shrink-0 mt-0.5 animate-pulse" size={28} />
                )}
                <div>
                  <h4 className={`font-bold text-sm ${simToast.type === 'error' ? 'text-red-600' : 'text-yellow-400'}`}>
                    {simToast.type === 'error' ? 'CẢNH BÁO KHẨN CẤP' : 'CẦN CHÚ Ý (WARNING)'}
                  </h4>
                  <p className={`text-sm mt-1.5 leading-relaxed ${simToast.type === 'error' ? 'text-gray-700' : 'text-gray-300'}`}>
                    {simToast.msg}
                  </p>
                </div>
                <button onClick={() => setSimToast(null)} className="ml-4 text-gray-400 hover:text-gray-200">
                  <X size={20} />
                </button>
              </div>
            </div>
          )}

          <MapContainer 
            center={[11.2000, 106.5000]} 
            zoom={8} 
            className="h-full w-full"
            zoomControl={false}
          >
            <ZoomControl position="bottomright" />
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Bản đồ Vệ tinh (Google Satellite)">
                <TileLayer
                  attribution='&copy; Google Maps'
                  url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Bản đồ Giao thông (Google Streets)">
                <TileLayer
                  attribution='&copy; Google Maps'
                  url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                />
              </LayersControl.BaseLayer>
            </LayersControl>
            <MapUpdater farms={farms} />
            
            {/* Render Route và Moving Marker cho Kịch bản S1/S2 */}
            {activeSimulation && (
              <>
                <Polyline 
                  positions={[
                    [activeSimulation.farmA.latitude || 11.2, activeSimulation.farmA.longitude || 106.5],
                    [activeSimulation.farmB.latitude || 11.2, activeSimulation.farmB.longitude || 106.5]
                  ]} 
                  pathOptions={{ 
                    color: activeSimulation.type === 'S1' ? 'red' : '#eab308', 
                    weight: 4, 
                    dashArray: '10, 10', 
                    className: 'animate-pulse' 
                  }} 
                />
                <MovingMarker 
                  start={[activeSimulation.farmA.latitude || 11.2, activeSimulation.farmA.longitude || 106.5]}
                  end={[activeSimulation.farmB.latitude || 11.2, activeSimulation.farmB.longitude || 106.5]}
                  duration={4000} // Di chuyển trong 4 giây
                  iconType={activeSimulation.type === 'S1' ? 'person' : 'truck'}
                  onComplete={() => triggerSimulationComplete(activeSimulation.type, activeSimulation.farmA, activeSimulation.farmB)}
                />
              </>
            )}

            {farms.map((farm) => (
              <Marker 
                key={farm.id} 
                position={[farm.latitude || 11.2, farm.longitude || 106.5]}
                icon={getMarkerIcon(farm.overall_status)}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                  <div className="font-sans min-w-[120px]">
                    <strong className="block text-sm text-gray-800">{farm.farm_name}</strong>
                    <span className="block text-xs text-gray-500 mb-1">{farm.farm_code}</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                      farm.overall_status === 'An toàn' ? 'bg-green-100 text-green-700' :
                      farm.overall_status === 'Cần chú ý' ? 'bg-yellow-100 text-yellow-700' :
                      farm.overall_status === 'Rủi ro' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {farm.overall_status}
                    </span>
                  </div>
                </Tooltip>
                <Popup>
                  <div className="p-1 min-w-[200px]">
                    <h3 className="font-bold text-base mb-1">{farm.farm_name}</h3>
                    <p className="text-sm text-gray-600 mb-2">Cấp độ: {farm.biosecurity_level}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="block text-gray-500 text-xs">Cảnh báo</span>
                        <span className="font-bold text-red-600">{farm.active_alert_count}</span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="block text-gray-500 text-xs">Xe bên trong</span>
                        <span className="font-bold">{farm.vehicles_inside_count}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/trai/${farm.farm_code}/tong-quan`)}
                      className="w-full bg-blue-600 text-white py-1.5 rounded hover:bg-blue-700 transition"
                    >
                      Vào quản trị trại
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Modal Chỉnh sửa Trại */}
      {editingFarm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-lg text-gray-800">Cấu hình thông tin Trại</h3>
              <button 
                onClick={() => setEditingFarm(null)}
                className="text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên trại</label>
                  <input 
                    type="text"
                    value={editForm.farm_name}
                    onChange={(e) => setEditForm({...editForm, farm_name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã trại</label>
                  <input 
                    type="text"
                    value={editForm.farm_code}
                    onChange={(e) => setEditForm({...editForm, farm_code: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cấp độ ATSH</label>
                  <select
                    value={editForm.biosecurity_level}
                    onChange={(e) => setEditForm({...editForm, biosecurity_level: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Cấp độ thấp">Cấp độ thấp</option>
                    <option value="Cấp độ trung bình">Cấp độ trung bình</option>
                    <option value="Cấp độ cao">Cấp độ cao</option>
                  </select>
                </div>
                <div className="col-span-2 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
                    <input 
                      type="text"
                      value={editForm.location_name}
                      onChange={(e) => setEditForm({...editForm, location_name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                    <input 
                      type="text"
                      value={editForm.province}
                      onChange={(e) => setEditForm({...editForm, province: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                    <input 
                      type="text"
                      value={editForm.district}
                      onChange={(e) => setEditForm({...editForm, district: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái tổng quan</label>
                  <select
                    value={editForm.overall_status}
                    onChange={(e) => setEditForm({...editForm, overall_status: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="An toàn">An toàn</option>
                    <option value="Cần chú ý">Cần chú ý</option>
                    <option value="Rủi ro">Rủi ro</option>
                    <option value="Rủi ro cao">Rủi ro cao</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Điểm Đánh Giá ATSH (0-100)</label>
                  <input 
                    type="number"
                    min="0" max="100"
                    value={editForm.risk_score}
                    onChange={(e) => {
                      const score = parseInt(e.target.value) || 0;
                      let status = 'Rủi ro cao';
                      if (score > 90) status = 'An toàn';
                      else if (score >= 80) status = 'Cần chú ý';
                      else if (score >= 70) status = 'Rủi ro';
                      setEditForm({...editForm, risk_score: score, overall_status: status});
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vĩ độ (Latitude)</label>
                  <input 
                    type="number"
                    step="any"
                    value={editForm.latitude}
                    onChange={(e) => setEditForm({...editForm, latitude: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kinh độ (Longitude)</label>
                  <input 
                    type="number"
                    step="any"
                    value={editForm.longitude}
                    onChange={(e) => setEditForm({...editForm, longitude: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
              <button 
                onClick={() => setEditingFarm(null)}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isUpdating}
              >
                Hủy bỏ
              </button>
              <button 
                onClick={async () => {
                  setIsUpdating(true);
                  const payload = { 
                    farm_name: editForm.farm_name,
                    farm_code: editForm.farm_code,
                    location_name: editForm.location_name,
                    province: editForm.province,
                    district: editForm.district,
                    biosecurity_level: editForm.biosecurity_level,
                    overall_status: editForm.overall_status,
                    risk_score: editForm.risk_score,
                    latitude: editForm.latitude, 
                    longitude: editForm.longitude 
                  };

                  let error;
                  if (editingFarm.id) {
                    const res = await supabase.from('farms').update(payload).eq('id', editingFarm.id);
                    error = res.error;
                  } else {
                    const res = await supabase.from('farms').insert([payload]);
                    error = res.error;
                  }
                  
                  if (!error) {
                    await fetchFarms();
                    setEditingFarm(null);
                  } else {
                    alert('Có lỗi xảy ra khi lưu: ' + error.message);
                  }
                  setIsUpdating(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
                disabled={isUpdating}
              >
                {isUpdating ? 'Đang lưu...' : (
                  <>
                    <Save size={18} className="mr-2" />
                    Lưu cấu hình
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
