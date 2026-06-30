import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, LayersControl, ZoomControl, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  LogOut, RefreshCw, Settings, X, Save, Plus, Trash2, 
  Play, RotateCcw, AlertTriangle, Info, 
  Moon, Sun, Map as MapIcon, Menu, ShieldCheck,
  Building2, MapPin, Activity, AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

// Cấu hình Icon Marker tùy chỉnh nổi bật và động theo màu trạng thái
const getMarkerIcon = (status: string) => {
  let colorClass = 'bg-amber-500';
  let borderClass = 'bg-amber-600';
  
  if (status === 'An toàn') {
    colorClass = 'bg-emerald-500';
    borderClass = 'bg-emerald-600';
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
        <div class="relative inline-flex items-center justify-center w-5 h-5 ${borderClass} border-[3px] border-white dark:border-slate-800 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
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
      <div class="relative flex items-center justify-center w-8 h-8 -ml-4 -mt-4 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)] border-2 border-white z-1000 animate-bounce">
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
      <div class="relative flex items-center justify-center w-8 h-8 -ml-4 -mt-4 bg-amber-400 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.8)] border-2 border-slate-900 z-1000 animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-900">
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
  const { t } = useTranslation();
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  
  // Sidebar state for mobile responsiveness
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className="h-screen w-full relative overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans">
      
      {/* Map Layer (Takes full screen behind everything) */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={[11.2000, 106.5000]} 
          zoom={8} 
          className={cn("h-full w-full", isDark ? "map-dark-filter" : "")}
          zoomControl={false}
        >
          <ZoomControl position="bottomright" />
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Vệ tinh (Satellite)">
              <TileLayer
                attribution='&copy; Google'
                url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Đường phố (Streets)">
              <TileLayer
                attribution='&copy; Google'
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
                  color: activeSimulation.type === 'S1' ? '#ef4444' : '#f59e0b', 
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
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div className="font-sans px-1 py-0.5">
                  <strong className="block text-sm font-semibold text-slate-800">{farm.farm_name}</strong>
                  <span className="block text-xs text-slate-500 mb-1">{farm.farm_code}</span>
                  <span className={cn(
                    "inline-block px-2 py-0.5 rounded-full text-xs font-bold border",
                    farm.overall_status === 'An toàn' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    farm.overall_status === 'Cần chú ý' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    farm.overall_status === 'Rủi ro' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  )}>
                    {farm.overall_status}
                  </span>
                </div>
              </Tooltip>
              <Popup className="glass-popup">
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-base mb-1 text-slate-800">{farm.farm_name}</h3>
                  <p className="text-sm text-slate-600 mb-3 flex items-center">
                    <ShieldCheck size={14} className="mr-1 text-slate-400" /> 
                    {farm.biosecurity_level}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-center">
                      <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Cảnh báo</span>
                      <span className="font-bold text-red-600 text-lg">{farm.active_alert_count}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-center">
                      <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Xe Nội Bộ</span>
                      <span className="font-bold text-slate-700 text-lg">{farm.vehicles_inside_count}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/trai/${farm.farm_code}/tong-quan`)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition-colors font-medium text-sm shadow-sm flex items-center justify-center"
                  >
                    Vào Quản Trị Trại
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Header Glassmorphism Layer */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="absolute top-0 left-0 right-0 h-16 lg:h-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/50 dark:border-slate-800/50 px-4 lg:px-6 flex justify-between items-center z-50 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <button 
            className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 px-3 py-2 rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700/50">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <MapIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base lg:text-lg font-bold text-slate-800 dark:text-white leading-tight">{t('map_title')}</h1>
              <p className="text-[10px] lg:text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider hidden sm:block">{t('map_subtitle')}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 lg:space-x-3">
          {/* Add Farm Button (Desktop only for cleanliness, or icon on mobile) */}
          <button 
            onClick={() => {
              setEditingFarm({ id: null });
              setEditForm({ 
                farm_name: '', farm_code: `FARM-${Math.floor(Math.random() * 1000)}`, location_name: '', province: '', district: '', 
                biosecurity_level: 'Cấp độ trung bình', overall_status: 'An toàn', risk_score: 95, latitude: 11.2, longitude: 106.5 
              });
            }}
            className="hidden sm:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all font-medium text-sm"
          >
            <Plus size={18} />
            <span>{t('add_farm')}</span>
          </button>
          
          <button onClick={fetchFarms} className="p-2 lg:px-4 lg:py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-2 font-medium text-sm">
            <RefreshCw size={18} />
            <span className="hidden lg:inline">{t('refresh')}</span>
          </button>

          <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-1 lg:mx-2 hidden sm:block"></div>

          {/* Dark Mode */}
          <button 
            onClick={toggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button onClick={handleLogout} className="p-2 lg:px-4 lg:py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors flex items-center gap-2 font-medium text-sm">
            <LogOut size={18} />
            <span className="hidden lg:inline">{t('logout')}</span>
          </button>
        </div>
      </motion.header>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth < 1024 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-60 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Sidebar (List Farms) */}
      <motion.div
        initial={false}
        animate={{ 
          x: isSidebarOpen ? 0 : -400,
          opacity: isSidebarOpen ? 1 : (window.innerWidth >= 1024 ? 1 : 0)
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className={cn(
          "fixed top-0 left-0 bottom-0 w-[320px] sm:w-[360px] z-70 flex flex-col",
          "bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl border-r border-slate-200/50 dark:border-slate-800/50",
          "lg:absolute lg:top-24 lg:left-6 lg:bottom-6 lg:rounded-3xl lg:border lg:w-[380px]"
        )}
      >
        <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 rounded-t-3xl mt-16 lg:mt-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Building2 size={20} className="text-emerald-500" />
              Danh sách trại ({farms.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Quản lý và giám sát đa điểm</p>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mb-3 text-emerald-500" />
              <p className="font-medium text-sm">Đang tải dữ liệu chuỗi trại...</p>
            </div>
          ) : (
            <AnimatePresence>
              {farms.map((farm, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={farm.id} 
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border bg-white dark:bg-slate-800/50 p-4 shadow-sm hover:shadow-md transition-all duration-300",
                    farm.overall_status === 'An toàn' ? 'border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-400' :
                    farm.overall_status === 'Cần chú ý' ? 'border-yellow-200 dark:border-yellow-900/50 hover:border-yellow-400' :
                    farm.overall_status === 'Rủi ro' ? 'border-orange-200 dark:border-orange-900/50 hover:border-orange-400' :
                    'border-red-300 dark:border-red-900/50 hover:border-red-500 bg-red-50/30 dark:bg-red-900/10'
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white text-base leading-tight">{farm.farm_name}</h3>
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1 bg-slate-100 dark:bg-slate-800 inline-block px-1.5 py-0.5 rounded">{farm.farm_code}</p>
                    </div>
                    <span className={cn(
                      "px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1",
                      farm.overall_status === 'An toàn' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' :
                      farm.overall_status === 'Cần chú ý' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300' :
                      farm.overall_status === 'Rủi ro' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300' :
                      'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                    )}>
                      {farm.overall_status === 'An toàn' ? <ShieldCheck size={12}/> : 
                       farm.overall_status === 'Rủi ro cao' ? <AlertCircle size={12}/> : <AlertTriangle size={12}/>}
                      {farm.overall_status}
                    </span>
                  </div>
                  
                  <div className="text-sm space-y-2 mb-4">
                    <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                      <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{farm.location_name} - {farm.district}, {farm.province}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Activity size={16} className="text-slate-400 shrink-0" />
                      <span>Level: <strong className="text-slate-800 dark:text-slate-200">{farm.biosecurity_level}</strong></span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate(`/trai/${farm.farm_code}/tong-quan`)}
                      className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
                    >
                      Truy cập
                    </button>
                    <button 
                      onClick={() => {
                        setEditingFarm(farm);
                        setEditForm({ ...farm });
                      }}
                      className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                      title="Chỉnh sửa"
                    >
                      <Settings size={18} />
                    </button>
                    <button 
                      onClick={async () => {
                        if (confirm(`Bạn có chắc muốn xóa trại "${farm.farm_name}" không?`)) {
                          const { error } = await supabase.from('farms').delete().eq('id', farm.id);
                          if (!error) fetchFarms();
                          else alert('Lỗi: ' + error.message);
                        }
                      }}
                      className="p-2 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Floating Simulation Action Menu (Desktop: Bottom right, Mobile: Bottom right above FAB) */}
      <div className="absolute bottom-6 right-4 lg:bottom-8 lg:right-8 z-50 flex flex-col items-end">
        {showSimMenu && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mb-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl w-72 lg:w-80 overflow-hidden border border-slate-200/50 dark:border-slate-700/50 origin-bottom-right"
          >
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700/50">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Mô Phỏng Kịch Bản Trực Tiếp</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Thử nghiệm các tình huống rủi ro liên trại</p>
            </div>
            <div className="p-2 space-y-1">
              <button 
                onClick={() => runGlobalScenario('S1')}
                className="w-full text-left p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition flex items-start group"
              >
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center mr-3 shrink-0 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="text-red-600 dark:text-red-400" size={16} />
                </div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-white text-sm">S1: Vi phạm cách ly 48h</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Nhân sự di chuyển giữa 2 trại sai quy định</div>
                </div>
              </button>
              <button 
                onClick={() => runGlobalScenario('S2')}
                className="w-full text-left p-3 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition flex items-start group"
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mr-3 shrink-0 group-hover:scale-110 transition-transform">
                  <Info className="text-amber-600 dark:text-amber-400" size={16} />
                </div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-white text-sm">S2: Xe cám liên trại</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Xe tải tiến vào cổng trại B sau khi rời trại A</div>
                </div>
              </button>
              <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1 mx-2"></div>
              <button 
                onClick={resetGlobalSimulation}
                className="w-full text-left p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition flex items-center text-slate-600 dark:text-slate-300"
              >
                <RotateCcw className="mr-3" size={18} />
                <span className="font-medium text-sm">Reset trạng thái An Toàn</span>
              </button>
            </div>
          </motion.div>
        )}

        <button 
          onClick={() => setShowSimMenu(!showSimMenu)}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all font-bold text-sm",
            showSimMenu ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900" : "bg-emerald-600 hover:bg-emerald-700 text-white"
          )}
        >
          {showSimMenu ? <X size={20} /> : <Play size={20} className="fill-current" />}
          <span className="hidden sm:inline">{showSimMenu ? 'Đóng Menu' : 'Mô Phỏng Rủi Ro'}</span>
        </button>
      </div>

      {/* Simulation Toast (Bottom Left or Center) */}
      <AnimatePresence>
        {simToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-24 lg:bottom-8 left-4 right-4 lg:left-1/2 lg:-translate-x-1/2 z-80 pointer-events-none"
          >
            <div className={cn(
              "mx-auto max-w-lg rounded-2xl shadow-2xl p-5 flex items-start border backdrop-blur-xl pointer-events-auto",
              simToast.type === 'error' ? 'bg-white/95 dark:bg-slate-900/95 border-red-500/50' : 'bg-slate-900/95 border-amber-500/50 text-white'
            )}>
              {simToast.type === 'error' ? (
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-4 shrink-0">
                  <AlertTriangle className="text-red-600 dark:text-red-400 animate-pulse" size={24} />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mr-4 shrink-0">
                  <AlertTriangle className="text-amber-400 animate-pulse" size={24} />
                </div>
              )}
              <div className="flex-1">
                <h4 className={cn("font-bold text-sm tracking-wide uppercase", simToast.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-amber-400')}>
                  {simToast.type === 'error' ? 'Cảnh báo khẩn cấp' : 'Cần chú ý (Warning)'}
                </h4>
                <p className={cn("text-sm mt-1 leading-relaxed", simToast.type === 'error' ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300')}>
                  {simToast.msg}
                </p>
              </div>
              <button onClick={() => setSimToast(null)} className="ml-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Chỉnh sửa / Thêm Trại */}
      <AnimatePresence>
        {editingFarm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-100 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
                  <Settings className="text-emerald-500" />
                  {editingFarm.id ? 'Cấu hình thông tin Trại' : 'Thêm trại mới'}
                </h3>
                <button 
                  onClick={() => setEditingFarm(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white bg-white dark:bg-slate-800 rounded-full p-2 border border-slate-200 dark:border-slate-700 shadow-sm transition"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tên trại</label>
                    <input 
                      type="text"
                      value={editForm.farm_name}
                      onChange={(e) => setEditForm({...editForm, farm_name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-800 dark:text-white"
                      placeholder="VD: Trại heo Đồng Nai"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Mã trại</label>
                    <input 
                      type="text"
                      value={editForm.farm_code}
                      onChange={(e) => setEditForm({...editForm, farm_code: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Cấp độ ATSH</label>
                    <select
                      value={editForm.biosecurity_level}
                      onChange={(e) => setEditForm({...editForm, biosecurity_level: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-800 dark:text-white appearance-none"
                    >
                      <option value="Cấp độ thấp">Cấp độ thấp</option>
                      <option value="Cấp độ trung bình">Cấp độ trung bình</option>
                      <option value="Cấp độ cao">Cấp độ cao</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Địa điểm</label>
                      <input 
                        type="text"
                        value={editForm.location_name}
                        onChange={(e) => setEditForm({...editForm, location_name: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tỉnh/Thành phố</label>
                      <input 
                        type="text"
                        value={editForm.province}
                        onChange={(e) => setEditForm({...editForm, province: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Quận/Huyện</label>
                      <input 
                        type="text"
                        value={editForm.district}
                        onChange={(e) => setEditForm({...editForm, district: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Trạng thái tổng quan</label>
                    <select
                      value={editForm.overall_status}
                      onChange={(e) => setEditForm({...editForm, overall_status: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-800 dark:text-white appearance-none"
                    >
                      <option value="An toàn">An toàn</option>
                      <option value="Cần chú ý">Cần chú ý</option>
                      <option value="Rủi ro">Rủi ro</option>
                      <option value="Rủi ro cao">Rủi ro cao</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Điểm ATSH (0-100)</label>
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
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-800 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Vĩ độ (Latitude)</label>
                    <input 
                      type="number"
                      step="any"
                      value={editForm.latitude}
                      onChange={(e) => setEditForm({...editForm, latitude: parseFloat(e.target.value)})}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-800 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Kinh độ (Longitude)</label>
                    <input 
                      type="number"
                      step="any"
                      value={editForm.longitude}
                      onChange={(e) => setEditForm({...editForm, longitude: parseFloat(e.target.value)})}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-800 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end gap-3 rounded-b-3xl">
                <button 
                  onClick={() => setEditingFarm(null)}
                  className="px-6 py-2.5 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium"
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
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center disabled:opacity-50 transition shadow-lg shadow-emerald-500/20 font-medium"
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
