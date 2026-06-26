import { Outlet, useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { LayoutDashboard, Map, Truck, Users, Settings, AlertTriangle, ArrowLeft, Cpu, ShieldAlert, LineChart, ClipboardCheck, FileText, CheckCircle, Menu, Moon, Sun, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LayoutQuanTri() {
  const { farmCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  
  const [farmId, setFarmId] = useState<string | null>(null);
  const [farmName, setFarmName] = useState('Đang tải...');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const fetchFarm = async () => {
      if (!farmCode) return;
      const { data } = await supabase.from('farms').select('id, farm_name').eq('farm_code', farmCode).single();
      if (data) {
        setFarmId(data.id);
        setFarmName(data.farm_name);
      }
    };
    fetchFarm();
  }, [farmCode]);

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

  const menu = [
    { name: 'Tổng quan trại', path: `/trai/${farmCode}/tong-quan`, icon: <LayoutDashboard size={20} /> },
    { name: 'Bản đồ nội bộ', path: `/trai/${farmCode}/ban-do-noi-bo`, icon: <Map size={20} /> },
    { name: 'Xe ra/vào', path: `/trai/${farmCode}/xe-ra-vao`, icon: <Truck size={20} /> },
    { name: 'Người ra/vào', path: `/trai/${farmCode}/nguoi-ra-vao`, icon: <Users size={20} /> },
    { name: 'Thiết bị', path: `/trai/${farmCode}/thiet-bi`, icon: <Settings size={20} /> },
    { name: 'Cảnh báo', path: `/trai/${farmCode}/canh-bao`, icon: <AlertTriangle size={20} /> },
    { name: 'Đánh giá trại định kỳ', path: `/trai/${farmCode}/danh-gia-dinh-ky`, icon: <ClipboardCheck size={20} /> },
    { name: 'Mô phỏng rủi ro ATSH', path: `/trai/${farmCode}/mo-phong-rui-ro`, icon: <ShieldAlert size={20} /> },
    { name: 'Bộ mô phỏng IoT', path: `/trai/${farmCode}/mo-phong-iot`, icon: <Cpu size={20} /> },
    { name: 'Báo cáo thông minh ATSH', path: `/trai/${farmCode}/bao-cao-thong-minh`, icon: <LineChart size={20} /> },
    { name: 'Đăng ký vào trại', path: `/trai/${farmCode}/dang-ky-vao-trai`, icon: <FileText size={20} /> },
    { name: 'Duyệt vào trại (Vet)', path: `/trai/${farmCode}/duyet-vao-trai`, icon: <CheckCircle size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-gray-800 shadow-xl flex flex-col transition-all duration-300`}>
        <div className={`p-4 border-b dark:border-gray-700 bg-blue-600 dark:bg-blue-800 text-white flex flex-col ${isCollapsed ? 'items-center' : ''}`}>
          <button 
            onClick={() => navigate('/ban-do-tong-quan')}
            className={`flex items-center text-blue-100 hover:text-white mb-4 text-sm transition ${isCollapsed ? 'justify-center' : ''}`}
            title="Quay lại bản đồ trại"
          >
            <ArrowLeft size={16} className={isCollapsed ? '' : 'mr-1'} />
            {!isCollapsed && <span>Quay lại bản đồ trại</span>}
          </button>
          {!isCollapsed && (
            <>
              <h2 className="font-bold text-lg leading-tight truncate">{farmName}</h2>
              <p className="text-blue-200 text-xs mt-1">{t('farm_admin', 'Quản trị trại')}</p>
            </>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto py-4 overflow-x-hidden custom-scrollbar">
          <ul className="space-y-1 px-2">
            {menu.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <span className={`${isCollapsed ? '' : 'mr-3'} ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center transition-colors duration-300">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              {menu.find(m => m.path === location.pathname)?.name || 'Quản trị'}
            </h1>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            {/* Language Switcher */}
            <div className="relative group">
              <button className="flex items-center space-x-1 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition">
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
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="Toggle Dark Mode"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Status */}
            <div className="flex items-center ml-2 border-l pl-4 dark:border-gray-700">
              Trạng thái: <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium text-xs">Đã kết nối</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          {farmId ? <Outlet context={{ farmId }} /> : <div className="flex h-full items-center justify-center text-gray-500">Đang tải dữ liệu trại...</div>}
        </main>
      </div>
    </div>
  );
}
